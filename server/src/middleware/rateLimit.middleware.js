import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../config/redis.js";
import AppError from "../utils/AppError.js";

const createRateLimiter = ({
    points,
    duration,
    keyPrefix,
}) => {
    const limiter = new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points,
        duration,
    });

    return async (req, res, next) => {
        try {
            await limiter.consume(req.ip);
            next();
        } catch (err) {
            if (err instanceof Error) {
                return next(err);
            }
            return next(new AppError("Too many requests. Please try again later.", 429));
        }
    }
}

export const registerRateLimiter = createRateLimiter({
    points: 5,
    duration: 15 * 60,
    keyPrefix: "register",
});

export const loginRateLimiter = createRateLimiter({
    points: 10,
    duration: 15 * 60,
    keyPrefix: "login",
});

export const refreshTokenRateLimiter = createRateLimiter({
    points: 20,
    duration: 15 * 60,
    keyPrefix: "refreshToken",
});

export const resendVerificationRateLimiter = createRateLimiter({
        points: 3,
        duration: 15 * 60,
        keyPrefix: "rate_limit_resend_verification",
});

export const forgotPasswordRateLimiter = createRateLimiter({
        points: 3,
        duration: 15 * 60,
        keyPrefix: "rate_limit_forgot_password",
});

export const resetPasswordRateLimiter = createRateLimiter({
        points: 5,
        duration: 15 * 60,
        keyPrefix: "rate_limit_reset_password",
});