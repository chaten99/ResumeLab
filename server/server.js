import { env } from "./src/config/env.js";
import logger from "./src/config/logger.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import app from "./src/app.js";

const startServer = async () => {
    await connectDB();
    await connectRedis();

    app.listen(env.PORT, () => {
        logger.info({
            port: env.PORT,
            environment: env.NODE_ENV,
        }, "ResumeLab Server started")
    });
}

startServer();