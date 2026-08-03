import User from "../models/user.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import AppError from "../utils/AppError.js";
import { emitToUser, emitToAdmin } from "../config/socket.js";

export const getBalance = async (userId) => {
    const user = await User.findById(userId).select("credits").lean();
    return user?.credits || 0;
};

export const hasEnoughCredits = async (userId, requiredAmount) => {
    const balance = await getBalance(userId);
    return balance >= requiredAmount;
};

export const deductCredits = async ({ userId, amount, type = "ai_usage", action, reason, referenceId }) => {
    if (amount <= 0) {
        throw new AppError("Deduction amount must be greater than zero", 400);
    }

    const user = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { new: true }
    );

    if (!user) {
        const currentBalance = await getBalance(userId);
        throw new AppError(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`, 402);
    }

    const ledgerEntry = await CreditLedger.create({
        userId,
        amount: -amount,
        type,
        balanceAfter: user.credits,
        action,
        reason: reason || `Deducted ${amount} credits for ${action}`,
        referenceId,
    });

    emitToUser(userId, "credits:updated", {
        credits: user.credits,
        change: -amount,
        reason: ledgerEntry.reason,
        remainingBalance: user.credits,
    });

    emitToUser(userId, "user:updated", {
        id: user._id,
        credits: user.credits,
        plan: user.plan,
    });

    emitToAdmin("admin:telemetry", {
        type: "credits_used",
        userId,
        amount: -amount,
        action,
    });

    return { user, ledgerEntry };
};

export const addCredits = async ({ userId, amount, type = "bonus", action, reason, referenceId }) => {
    if (amount <= 0) {
        throw new AppError("Addition amount must be greater than zero", 400);
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: amount } },
        { new: true }
    );

    if (!user) {
        throw new AppError("User not found for credit addition", 404);
    }

    const ledgerEntry = await CreditLedger.create({
        userId,
        amount: Math.abs(amount),
        type,
        balanceAfter: user.credits,
        action,
        reason: reason || `Added ${amount} credits for ${action}`,
        referenceId,
    });

    emitToUser(userId, "credits:updated", {
        credits: user.credits,
        change: Math.abs(amount),
        reason: ledgerEntry.reason,
        remainingBalance: user.credits,
    });

    emitToUser(userId, "user:updated", {
        id: user._id,
        credits: user.credits,
        plan: user.plan,
    });

    emitToAdmin("admin:telemetry", {
        type: "credits_added",
        userId,
        amount: Math.abs(amount),
        action,
    });

    return { user, ledgerEntry };
};

export const refundCredits = async ({ userId, amount, action = "System Refund", reason = "AI Processing Failure Refund", referenceId }) => {
    return await addCredits({
        userId,
        amount,
        type: "refund",
        action,
        reason,
        referenceId,
    });
};

export const getCreditHistory = async (userId) => {
    return await CreditLedger.find({ userId }).sort({ createdAt: -1 }).lean();
};
