import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";
import Analysis from "../models/analysis.model.js";
import Transaction from "../models/transaction.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import AdminAuditLog from "../models/adminAuditLog.model.js";
import AppError from "../utils/AppError.js";
import { addCredits, deductCredits } from "../services/creditLedger.service.js";
import { PLANS } from "../services/payment.service.js";
import { checkSystemHealth } from "../services/systemHealth.service.js";

const createAuditLog = async ({ adminId, action, targetUserId, targetEmail, oldValue, newValue, req }) => {
    try {
        await AdminAuditLog.create({
            adminId,
            action,
            targetUserId,
            targetEmail,
            oldValue,
            newValue,
            ip: req?.ip || req?.headers["x-forwarded-for"] || "",
        });
    } catch (err) {
        console.error("Failed to create admin audit log:", err);
    }
};

export const getOverviewStats = async (req, res) => {
    const userRoleQuery = { role: { $ne: "admin" } };

    const totalUsers = await User.countDocuments(userRoleQuery);
    const verifiedUsers = await User.countDocuments({ ...userRoleQuery, isEmailVerified: true });
    const unverifiedUsers = await User.countDocuments({ ...userRoleQuery, isEmailVerified: false });
    const activeSubscriptions = await User.countDocuments({ ...userRoleQuery, subscriptionStatus: "active" });

    const freeUsers = await User.countDocuments({ ...userRoleQuery, plan: "FREE" });
    const proUsers = await User.countDocuments({ ...userRoleQuery, plan: "PRO" });
    const premiumUsers = await User.countDocuments({ ...userRoleQuery, plan: "PREMIUM" });

    const ledgerAgg = await CreditLedger.aggregate([
        {
            $group: {
                _id: null,
                creditsIssued: {
                    $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
                },
                creditsConsumed: {
                    $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] },
                },
            },
        },
    ]);

    const creditsIssued = ledgerAgg[0]?.creditsIssued || 0;
    const creditsConsumed = ledgerAgg[0]?.creditsConsumed || 0;

    const revenueAgg = await Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const recentRegistrations = await User.find(userRoleQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email plan credits isEmailVerified createdAt")
        .lean();

    const recentPayments = await Transaction.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    return res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            verifiedUsers,
            unverifiedUsers,
            activeSubscriptions,
            freeUsers,
            proUsers,
            premiumUsers,
            creditsIssued,
            creditsConsumed,
            totalRevenue,
        },
        recentRegistrations,
        recentPayments,
    });
};

export const getAnalytics = async (req, res) => {
    const userRoleQuery = { role: { $ne: "admin" } };
    const totalResumes = await Resume.countDocuments();
    const totalAnalyses = await Analysis.countDocuments({ status: "completed" });

    const planDistribution = [
        { plan: "FREE", count: await User.countDocuments({ ...userRoleQuery, plan: "FREE" }) },
        { plan: "PRO", count: await User.countDocuments({ ...userRoleQuery, plan: "PRO" }) },
        { plan: "PREMIUM", count: await User.countDocuments({ ...userRoleQuery, plan: "PREMIUM" }) },
    ];

    return res.status(200).json({
        success: true,
        analytics: {
            totalResumes,
            totalAnalyses,
            planDistribution,
        },
    });
};

export const getSystemHealthController = async (req, res) => {
    const health = await checkSystemHealth();
    return res.status(200).json({
        success: true,
        health,
    });
};

export const getUsers = async (req, res) => {
    const {
        search,
        plan,
        verified,
        status,
        sort = "newest",
        page = 1,
        limit = 10,
    } = req.query;

    const query = { role: { $ne: "admin" } };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            query.$or.push({ _id: search });
        }
    }

    if (plan && ["FREE", "PRO", "PREMIUM"].includes(plan)) {
        query.plan = plan;
    }

    if (verified !== undefined && verified !== "") {
        query.isEmailVerified = verified === "true";
    }

    if (status === "disabled") {
        query.isDisabled = true;
    } else if (status === "active") {
        query.isDisabled = false;
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select("-password")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean();

    return res.status(200).json({
        success: true,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        },
        users,
    });
};

export const getUserDetails = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).select("-password").lean();
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const resumeCount = await Resume.countDocuments({ userId: user._id });
    const analysisCount = await Analysis.countDocuments({ userId: user._id });
    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const creditHistory = await CreditLedger.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
        success: true,
        user: {
            ...user,
            resumeCount,
            analysisCount,
        },
        transactions,
        creditHistory,
    });
};

export const disableUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.role === "admin") {
        throw new AppError("Super Admin account cannot be disabled", 400);
    }

    user.isDisabled = true;
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "DISABLED_ACCOUNT",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { isDisabled: false },
        newValue: { isDisabled: true },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User account disabled successfully",
    });
};

export const enableUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.isDisabled = false;
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "ENABLED_ACCOUNT",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { isDisabled: true },
        newValue: { isDisabled: false },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User account enabled successfully",
    });
};

export const verifyUserEmail = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.isEmailVerified = true;
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "VERIFIED_EMAIL",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { isEmailVerified: false },
        newValue: { isEmailVerified: true },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User email force verified",
    });
};

export const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        throw new AppError("Password must be at least 8 characters long", 400);
    }

    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "RESET_PASSWORD",
        targetUserId: user._id,
        targetEmail: user.email,
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User password reset successfully",
    });
};

export const changeUserCredits = async (req, res) => {
    const { id } = req.params;
    const { mode, amount, reason } = req.body;

    if (!mode || !["increase", "decrease", "set"].includes(mode)) {
        throw new AppError("Invalid mode. Must be increase, decrease, or set", 400);
    }

    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const oldCredits = user.credits;

    if (mode === "increase") {
        await addCredits({
            userId: user._id,
            amount: Number(amount),
            type: "admin",
            action: "Admin Adjustment",
            reason: reason || "Manual credit addition by Admin",
        });
    } else if (mode === "decrease") {
        await deductCredits({
            userId: user._id,
            amount: Number(amount),
            type: "admin",
            action: "Admin Adjustment",
            reason: reason || "Manual credit deduction by Admin",
        });
    } else if (mode === "set") {
        const targetValue = Math.max(0, Number(amount));
        const diff = targetValue - user.credits;
        user.credits = targetValue;
        await user.save();

        await CreditLedger.create({
            userId: user._id,
            amount: diff,
            type: "admin",
            balanceAfter: targetValue,
            action: "Admin Set Balance",
            reason: reason || `Admin set exact credit balance to ${targetValue}`,
        });
    }

    const updatedUser = await User.findById(id).select("credits");

    await createAuditLog({
        adminId: req.user._id,
        action: "CHANGED_CREDITS",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { credits: oldCredits },
        newValue: { credits: updatedUser.credits },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User credits updated successfully",
        credits: updatedUser.credits,
    });
};

export const changeUserSubscription = async (req, res) => {
    const { id } = req.params;
    const { plan } = req.body;

    if (!plan || !["FREE", "PRO", "PREMIUM"].includes(plan)) {
        throw new AppError("Invalid plan specified", 400);
    }

    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const oldPlan = user.plan;
    const planCredits = PLANS[plan]?.credits || 10;

    user.plan = plan;
    user.subscriptionStatus = plan === "FREE" ? "none" : "active";
    user.subscriptionStart = new Date();
    user.subscriptionEnd = plan === "FREE" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (plan !== "FREE") {
        user.credits += planCredits;
        await CreditLedger.create({
            userId: user._id,
            amount: planCredits,
            type: "subscription",
            balanceAfter: user.credits,
            action: "Admin Subscription Assignment",
            reason: `Admin assigned ${plan} plan`,
        });
    }

    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "CHANGED_SUBSCRIPTION",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { plan: oldPlan },
        newValue: { plan: user.plan },
        req,
    });

    return res.status(200).json({
        success: true,
        message: `Subscription updated to ${plan}`,
        user: {
            plan: user.plan,
            credits: user.credits,
            subscriptionStatus: user.subscriptionStatus,
        },
    });
};

export const extendUserSubscription = async (req, res) => {
    const { id } = req.params;
    const { days = 30 } = req.body;

    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
    user.subscriptionEnd = new Date(currentEnd.getTime() + Number(days) * 24 * 60 * 60 * 1000);
    user.subscriptionStatus = "active";
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "EXTENDED_SUBSCRIPTION",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { subscriptionEnd: currentEnd },
        newValue: { subscriptionEnd: user.subscriptionEnd },
        req,
    });

    return res.status(200).json({
        success: true,
        message: `Subscription extended by ${days} days`,
        subscriptionEnd: user.subscriptionEnd,
    });
};

export const expireUserSubscription = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const oldPlan = user.plan;
    user.plan = "FREE";
    user.subscriptionStatus = "canceled";
    user.subscriptionEnd = new Date();
    await user.save();

    await createAuditLog({
        adminId: req.user._id,
        action: "EXPIRED_SUBSCRIPTION",
        targetUserId: user._id,
        targetEmail: user.email,
        oldValue: { plan: oldPlan },
        newValue: { plan: "FREE" },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "User subscription expired and reverted to FREE",
    });
};

export const getAllResumes = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Resume.countDocuments();
    const resumes = await Resume.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    return res.status(200).json({
        success: true,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        },
        resumes,
    });
};

export const deleteResumeByAdmin = async (req, res) => {
    const { id } = req.params;
    const resume = await Resume.findByIdAndDelete(id);
    if (!resume) {
        throw new AppError("Resume not found", 404);
    }

    await Analysis.deleteMany({ resumeId: id });

    await createAuditLog({
        adminId: req.user._id,
        action: "DELETED_RESUME",
        targetUserId: resume.userId,
        oldValue: { resumeId: id, name: resume.originalName },
        req,
    });

    return res.status(200).json({
        success: true,
        message: "Resume deleted by admin",
    });
};

export const getAllPayments = async (req, res) => {
    const transactions = await Transaction.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        count: transactions.length,
        transactions,
    });
};

export const getAllCreditLedger = async (req, res) => {
    const { search, type } = req.query;
    const query = {};

    if (type) {
        query.type = type;
    }

    const history = await CreditLedger.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        count: history.length,
        history,
    });
};

export const getAuditLogs = async (req, res) => {
    const logs = await AdminAuditLog.find()
        .populate("adminId", "name email")
        .populate("targetUserId", "name email")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        count: logs.length,
        logs,
    });
};
