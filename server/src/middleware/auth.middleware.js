import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/token.js";

const authenticate = async (req, res, next) => {
    let accessToken = req.cookies?.accessToken;

    if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
        accessToken = req.headers.authorization.split(" ")[1];
    }

    if (!accessToken) {
        return next(new AppError("Authentication required", 401));
    }

    let decoded;
    try {
        decoded = verifyAccessToken(accessToken);
    } catch {
        throw new AppError("Invalid or expired access token", 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
        throw new AppError("User not found", 401);
    }

    if (user.isDisabled) {
        throw new AppError("This account has been disabled by the administrator.", 403);
    }

    req.user = user;
    next();
};

export default authenticate;