// TEMPORARY DEVELOPER TOOL
import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";

export const devVerifyEmail = async (req, res) => {
    // 1. Feature Flag Guard (404 Not Found if disabled)
    if (env.ENABLE_DEV_EMAIL_BYPASS !== "true" && env.ENABLE_DEV_EMAIL_BYPASS !== true) {
        throw new AppError("Not Found", 404);
    }

    const { email, secret } = req.body;

    // 2. Secret Validation (403 Forbidden with exact message)
    const expectedSecret = env.DEV_BYPASS_SECRET || "developer-secret";
    if (!secret || secret !== expectedSecret) {
        throw new AppError("Invalid developer secret.", 403);
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        throw new AppError("Please enter a valid email.", 400);
    }

    // 3. Find User (404 if not found)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new AppError("No account exists with this email.", 404);
    }

    // 4. Check if user is already verified (400)
    if (user.isEmailVerified) {
        throw new AppError("This account is already verified.", 400);
    }

    // 5. Update Verification & Delete OTP Tokens
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
