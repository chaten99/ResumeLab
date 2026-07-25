import { env } from "../config/env.js";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    logger.error({
        err,
        method: req.method,
        path: req.originalUrl,
    }, "Request error");
    const response = {
        success: false,
        status,
        message: err.message || "Internal Server Error",
    }
    if(env.NODE_ENV === "development") {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
}

export default errorHandler;