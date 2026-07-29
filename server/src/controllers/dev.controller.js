// TEMPORARY DEVELOPER TOOL
import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";

export const devVerifyEmail = async (req, res) => {
    // 1. Secret Validation (403 Forbidden if secret missing or invalid)
    const expectedSecret = env.DEV_BYPASS_SECRET || process.env.DEV_BYPASS_SECRET || "developer-secret";
    const { email, secret } = req.body;

    if (!secret || secret !== expectedSecret) {
        throw new AppError("Invalid developer secret.", 403);
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        throw new AppError("Please enter a valid email.", 400);
    }

    // 2. Find User (404 if not found)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new AppError("No account exists with this email.", 404);
    }

    // 3. Check if user is already verified (400)
    if (user.isEmailVerified) {
        throw new AppError("This account is already verified.", 400);
    }

    // 4. Update Verification & Delete OTP Tokens
    user.isEmailVerified = true;
    await user.save();

    await Verification.deleteMany({
        userId: user._id,
        type: "email_verification",
    });

    return res.status(200).json({
        success: true,
        message: "Email verified successfully.",
    });
};
