import { env } from "../config/env.js";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.message || "Internal Server Error";

    if (err.code === 11000) {
        statusCode = 409;
        status = "fail";
        const field = Object.keys(err.keyPattern || {})[0];
        message = field ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` : "Resource already exists";
    }

    if(err.name === "CastError") {
        statusCode = 400;
        status = "fail";
        message = `Invalid ${err.path}`;
    }

    logger.error({
        err,
        method: req.method,
        path: req.originalUrl,
        statusCode,
    }, "Request error");

    const response = {
        success: false,
        status,
        message,
    };

    if(env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
}

export default errorHandler;