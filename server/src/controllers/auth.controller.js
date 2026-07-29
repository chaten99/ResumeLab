import User from "../models/user.model.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/token.js";
import {
    createSession,
    getSession,
    deleteSession,
    deleteAllUserSessions,
} from "../services/session.service.js";
import {
    setAuthCookies,
    setAccessTokenCookie,
    clearAuthCookies,
} from "../utils/cookies.js";
import Verification from "../models/verification.model.js";
import { env } from "../config/env.js";
import { parseDuration } from "../utils/duration.js";
import {
    generateOtp,
    hashOtp,
    verifyOtp,
} from "../utils/otp.js";
import {
    sendVerificationOtpEmail,
    sendPasswordResetOtpEmail,
} from "../services/authEmail.service.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    const otp = generateOtp();
    const codeHash = hashOtp(otp);

    const expiresAt = new Date(
        Date.now() + parseDuration(env.OTP_EXPIRES_IN)
    );

    await Verification.create({
        userId: user._id,
        type: "email_verification",
        codeHash,
        expiresAt,
    });

    try {
        await sendVerificationOtpEmail({
            email: user.email,
            name: user.name,
            otp,
            expiresIn: env.OTP_EXPIRES_IN,
        });
    } catch (emailError) {
        logger.error({ err: emailError, userId: user._id }, "Failed to send registration verification email");
    }

    return res.status(201).json({
        success: true,
        message: "Account created. Please verify your email.",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
        },
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    if (!user.isEmailVerified) {
        throw new AppError(
            "Please verify your email before logging in",
            403
        );
    }

    const sessionId = await createSession(user._id);
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString(), sessionId);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

export const resendVerificationOtp = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({
            success: true,
            message:
                "If an unverified account exists, a verification code has been sent.",
        });
    }

    if (user.isEmailVerified) {
        throw new AppError("Email is already verified", 400);
    }

    const otp = generateOtp();
    const codeHash = hashOtp(otp);

    const expiresAt = new Date(
        Date.now() + parseDuration(env.OTP_EXPIRES_IN)
    );

    await Verification.findOneAndUpdate(
        {
            userId: user._id,
            type: "email_verification",
        },
        {
            codeHash,
            expiresAt,
            attempts: 0,
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    await sendVerificationOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        expiresIn: env.OTP_EXPIRES_IN,
    });

    return res.status(200).json({
        success: true,
        message: "A new verification code has been sent.",
    });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({
            success: true,
            message:
                "If an account exists with this email, a password reset code has been sent.",
        });
    }

    const otp = generateOtp();
    const codeHash = hashOtp(otp);

    const expiresAt = new Date(
        Date.now() + parseDuration(env.OTP_EXPIRES_IN)
    );

    await Verification.findOneAndUpdate(
        {
            userId: user._id,
            type: "password_reset",
        },
        {
            codeHash,
            expiresAt,
            attempts: 0,
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    await sendPasswordResetOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        expiresIn: env.OTP_EXPIRES_IN,
    });

    return res.status(200).json({
        success: true,
        message:
            "If an account exists with this email, a password reset code has been sent.",
    });
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            "Invalid or expired password reset request",
            400
        );
    }

    const verification = await Verification.findOne({
        userId: user._id,
        type: "password_reset",
    });

    if (!verification) {
        throw new AppError(
            "Invalid or expired password reset request",
            400
        );
    }

    if (verification.expiresAt < new Date()) {
        await Verification.deleteOne({
            _id: verification._id,
        });

        throw new AppError(
            "Password reset code has expired",
            400
        );
    }

    const isValidOtp = verifyOtp(
        otp,
        verification.codeHash
    );

    if (!isValidOtp) {
        verification.attempts += 1;

        if (verification.attempts >= 5) {
            await Verification.deleteOne({
                _id: verification._id,
            });

            throw new AppError(
                "Too many incorrect attempts. Request a new password reset code.",
                429
            );
        }

        await verification.save();

        throw new AppError(
            "Invalid password reset code",
            400
        );
    }

    user.password = newPassword;

    await user.save();

    await Verification.deleteOne({
        _id: verification._id,
    });

    await deleteAllUserSessions(
        user._id.toString()
    );

    clearAuthCookies(res);

    return res.status(200).json({
        success: true,
        message:
            "Password reset successfully. Please log in again.",
    });
};

export const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError("Refresh token not found", 401);
    }
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const sessionUserId = await getSession(decoded.sessionId);
    if (!sessionUserId) {
        throw new AppError("Session expired or invalid", 401);
    }
    if (sessionUserId !== decoded.userId) {
        throw new AppError("Invalid session", 401);
    }
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new AppError("User no longer exists", 401);
    }

    const accessToken = generateAccessToken(
        user._id.toString()
    );

    setAccessTokenCookie(res, accessToken);
    return res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
    });
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid verification request", 400);
    }

    if (user.isEmailVerified) {
        throw new AppError("Email is already verified", 400);
    }

    const verification = await Verification.findOne({
        userId: user._id,
        type: "email_verification",
    });

    if (!verification) {
        throw new AppError(
            "Verification code is invalid or expired",
            400
        );
    }

    if (verification.expiresAt < new Date()) {
        await Verification.deleteOne({
            _id: verification._id,
        });

        throw new AppError(
            "Verification code has expired",
            400
        );
    }

    const isValidOtp = verifyOtp(
        otp,
        verification.codeHash
    );

    if (!isValidOtp) {
        verification.attempts += 1;

        if (verification.attempts >= 5) {
            await Verification.deleteOne({
                _id: verification._id,
            });

            throw new AppError(
                "Too many incorrect attempts. Request a new code.",
                429
            );
        }

        await verification.save();

        throw new AppError(
            "Invalid verification code",
            400
        );
    }

    user.isEmailVerified = true;

    await user.save();

    await Verification.deleteOne({
        _id: verification._id,
    });

    const sessionId = await createSession(user._id);

    const accessToken = generateAccessToken(
        user._id.toString()
    );

    const refreshToken = generateRefreshToken(
        user._id.toString(),
        sessionId
    );

    setAuthCookies(
        res,
        accessToken,
        refreshToken
    );

    return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: true,
        },
    });
};

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        try {
            const decoded = verifyRefreshToken(refreshToken);
            if (decoded.sessionId) {
                await deleteSession(decoded.sessionId);
            }
        } catch {
            // ignore invalid refresh token on logout
        }
    }
    clearAuthCookies(res);
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

export const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isEmailVerified: req.user.isEmailVerified,
            createdAt: req.user.createdAt,
        },
    });
};

export const me = getMe;