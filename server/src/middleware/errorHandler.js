import { env } from "../config/env.js";
import logger from "../config/logger.js";
import multer from "multer";

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let status = err.status || "error";
    let message = err.message || "Internal Server Error";

    if (err instanceof multer.MulterError) {
        status = "fail";

        if (err.code === "LIMIT_FILE_SIZE") {
            statusCode = 413;
            message = "Resume PDF cannot exceed 5 MB";
        } else if (err.code === "LIMIT_FILE_COUNT") {
            statusCode = 400;
            message = "Only one resume can be uploaded at a time";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            statusCode = 400;
            message = "Unexpected file field";
        } else {
            statusCode = 400;
            message = "Invalid file upload";
        }
    }

    if (err.code === 11000) {
        statusCode = 409;
        status = "fail";

        const field = Object.keys(
            err.keyPattern || {}
        )[0];

        message = field
            ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            : "Resource already exists";
    }

    if (err.name === "CastError") {
        statusCode = 400;
        status = "fail";
        message = `Invalid ${err.path}`;
    }

    logger.error(
        {
            err,
            method: req.method,
            path: req.originalUrl,
            statusCode,
        },
        "Request error"
    );

    const response = {
        success: false,
        status,
        message,
    };

    if (env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};

export default errorHandler;