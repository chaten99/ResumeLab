import pinoHttp from 'pino-http';
import logger from '../config/logger.js';

const httpLogger = pinoHttp({
    logger,
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
        ],
        censor: "[REDACTED]"
    }
});

export default httpLogger;