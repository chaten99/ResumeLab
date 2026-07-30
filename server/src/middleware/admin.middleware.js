import AppError from "../utils/AppError.js";

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError("Authentication required", 401));
    }
    if (req.user.role !== "admin") {
        return next(new AppError("Access denied. Administrator privilege required.", 403));
    }
    next();
};

export default requireAdmin;
