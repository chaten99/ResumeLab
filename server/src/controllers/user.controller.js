import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { getCreditHistory } from "../services/creditLedger.service.js";
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

    emitToUser(user._id, "user:updated", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
        isEmailVerified: user.isEmailVerified,
    });

    emitToUser(user._id, "notification:created", {
        title: "Profile Updated",
        message: "Your profile name was updated successfully.",
        type: "success",
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

    emitToUser(user._id, "notification:created", {
        title: "Password Changed",
        message: "Your account password was changed successfully.",
        type: "success",
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
