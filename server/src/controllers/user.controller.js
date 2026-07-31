import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";
import Analysis from "../models/analysis.model.js";
import Transaction from "../models/transaction.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import AppError from "../utils/AppError.js";
import { getCreditHistory } from "../services/creditLedger.service.js";
import { recordActivity, getUserActivities } from "../services/activity.service.js";
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createInAppNotification,
} from "../services/notification.service.js";
import { emitToUser } from "../config/socket.js";

export const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return res.status(200).json({
        success: true,
        user,
    });
};

export const updateProfile = async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
        throw new AppError("Name must be at least 2 characters long", 400);
    }

    const user = await User.findById(req.user._id);
    user.name = name.trim();
    await user.save();

    await recordActivity({
        userId: user._id,
        type: "profile_updated",
        description: `Updated profile name to "${user.name}"`,
    });

    await createInAppNotification({
        userId: user._id,
        title: "Profile Updated",
        message: `Your profile name was changed to "${user.name}".`,
        type: "success",
    });

    emitToUser(user._id, "user:updated", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
        isEmailVerified: user.isEmailVerified,
    });

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            credits: user.credits,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        throw new AppError("New password must be at least 8 characters long", 400);
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 400);
    }

    user.password = newPassword;
    await user.save();

    await recordActivity({
        userId: user._id,
        type: "password_changed",
        description: "Account password changed successfully",
    });

    await createInAppNotification({
        userId: user._id,
        title: "Password Changed",
        message: "Your account password was updated successfully.",
        type: "info",
    });

    return res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
};

export const getUserCredits = async (req, res) => {
    const user = await User.findById(req.user._id).select("credits plan");
    const history = await getCreditHistory(req.user._id);

    let lifetimeEarned = 0;
    let lifetimeUsed = 0;

    history.forEach((entry) => {
        if (entry.amount > 0) {
            lifetimeEarned += entry.amount;
        } else {
            lifetimeUsed += Math.abs(entry.amount);
        }
    });

    return res.status(200).json({
        success: true,
        credits: user.credits,
        plan: user.plan,
        lifetimeEarned,
        lifetimeUsed,
        history,
    });
};

export const getActivitiesHandler = async (req, res) => {
    const activities = await getUserActivities(req.user._id);
    return res.status(200).json({
        success: true,
        activities,
    });
};

export const getNotificationsHandler = async (req, res) => {
    const { notifications, unreadCount } = await getUserNotifications(req.user._id);
    return res.status(200).json({
        success: true,
        notifications,
        unreadCount,
    });
};

export const markNotificationReadHandler = async (req, res) => {
    const { id } = req.params;
    await markNotificationAsRead(req.user._id, id);
    return res.status(200).json({ success: true, message: "Notification marked as read" });
};

export const markAllNotificationsReadHandler = async (req, res) => {
    await markAllNotificationsAsRead(req.user._id);
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
};

export const deleteNotificationHandler = async (req, res) => {
    const { id } = req.params;
    await deleteNotification(req.user._id, id);
    return res.status(200).json({ success: true, message: "Notification deleted" });
};

export const exportUserData = async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password").lean();
    const resumes = await Resume.find({ userId }).lean();
    const analyses = await Analysis.find({ userId }).lean();
    const transactions = await Transaction.find({ userId }).lean();
    const creditLedger = await CreditLedger.find({ userId }).lean();

    return res.status(200).json({
        success: true,
        exportTimestamp: new Date().toISOString(),
        userData: {
            profile: user,
            resumes,
            analyses,
            transactions,
            creditLedger,
        },
    });
};

export const deactivateAccount = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.isDisabled = true;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Account deactivated successfully",
    });
};
