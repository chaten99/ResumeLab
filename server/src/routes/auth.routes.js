import { Router } from "express";
import {
    register,
    login,
    refreshAccessToken,
    logout,
    getMe,
    verifyEmail,
    resendVerificationOtp,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../validators/auth.schema.js";
import authenticate from "../middleware/auth.middleware.js";
import {
    registerRateLimiter,
    loginRateLimiter,
    refreshTokenRateLimiter,
    resendVerificationRateLimiter,
    forgotPasswordRateLimiter,
    resetPasswordRateLimiter
} from "../middleware/rateLimit.middleware.js";

const authRouter = Router();

authRouter.post(
    "/register",
    registerRateLimiter,
    validate(registerSchema),
    register
);

authRouter.post(
    "/login",
    loginRateLimiter,
    validate(loginSchema),
    login
);

authRouter.post(
    "/refresh-token",
    refreshTokenRateLimiter,
    refreshAccessToken
);

authRouter.post(
    "/verify-email",
    validate(verifyEmailSchema),
    verifyEmail
);

authRouter.post(
    "/resend-verification",
    resendVerificationRateLimiter,
    validate(resendVerificationSchema),
    resendVerificationOtp
);

authRouter.post(
    "/forgot-password",
    forgotPasswordRateLimiter,
    validate(forgotPasswordSchema),
    forgotPassword
);

authRouter.post(
    "/reset-password",
    resetPasswordRateLimiter,
    validate(resetPasswordSchema),
    resetPassword
);

authRouter.post("/logout", logout);

authRouter.get(
    "/me",
    authenticate,
    getMe
);

export default authRouter;