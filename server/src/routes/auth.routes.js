import { Router } from "express";
import {
    register,
    login,
    refreshAccessToken,
    logout,
    getMe
} from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.schema.js";
import authenticate from "../middleware/auth.middleware.js";
import {
    registerRateLimiter,
    loginRateLimiter,
    refreshTokenRateLimiter,
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

authRouter.post("/logout", logout);

authRouter.get(
    "/me",
    authenticate,
    getMe
);

export default authRouter;