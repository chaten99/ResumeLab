import pino from "pino";
import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";
const logger = pino({
    level: isDevelopment ? "debug" : "info",
    transport: isDevelopment ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
        }
    }
        : undefined,
    redact: {
        paths: [
            "password",
            "*.password",
            "req.headers.authorization",
            "req.headers.cookie",
        ],
        censor: "[REDACTED]"
    }
});

export default logger;