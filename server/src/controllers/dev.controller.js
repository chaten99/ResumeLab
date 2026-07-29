// TEMPORARY DEVELOPER BYPASS - REMOVE LATER
import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";

export const devVerifyEmail = async (req, res) => {
    // 1. Feature Flag Guard (404 if disabled)
    if (env.ENABLE_DEV_EMAIL_BYPASS !== "true" && env.ENABLE_DEV_EMAIL_BYPASS !== true) {
        throw new AppError("Not Found", 404);
    }

    const { email, secret } = req.body;

    // 2. Secret Guard (403 Forbidden if secret missing or invalid)
    const expectedSecret = env.DEV_BYPASS_SECRET || "developer-secret";
    if (!secret || secret !== expectedSecret) {
        throw new AppError("Forbidden", 403);
    }

    if (!email || typeof email !== "string") {
        throw new AppError("Email is required", 400);
    }

    // 3. Find User
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    // 4. Set Verified & Remove Verification Token
    user.isEmailVerified = true;
    await user.save();

    await Verification.deleteMany({
        userId: user._id,
        type: "email_verification",
    });

    return res.status(200).json({
        success: true,
        message: "User verified successfully.",
    });
};
