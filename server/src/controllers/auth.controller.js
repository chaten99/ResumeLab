import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/token.js";
import { createSession, getSession, deleteSession } from "../services/session.service.js";
import {
    setAuthCookies,
    setAccessTokenCookie,
    clearAuthCookies,
} from "../utils/cookies.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const user = await User.create({
        name,
        email,
        password
    });
    const sessionId = await createSession(user._id);
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString(), sessionId);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
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
        throw new AppError("Invalid email or password", 401);
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
}

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
}

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        try {
            const decoded = verifyRefreshToken(refreshToken);
            if (decoded.sessionId) {
                await deleteSession(decoded.sessionId);
            }
        } catch {
            // Invalid/expired token desnt prevent logout
        }
    }
    clearAuthCookies(res);
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
}

export const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            createdAt: req.user.createdAt,
        }
    })
}