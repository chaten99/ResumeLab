import Redis from "ioredis";
import { env } from "./env.js";
import logger from "./logger.js";

const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
});

redis.on("connect", () => {
    logger.info("Connected to Redis");
});

redis.on("ready", () => {
    logger.info("Redis connected and ready");
});

redis.on("error", (error) => {
    logger.error({
        err: error,
    }, "Redis connection error");
})

redis.on("close", () => {
    logger.warn("Redis connection closed");
});

export const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (error) {
        logger.fatal({
            err: error,
        }, "Failed to connect to Redis");
        process.exit(1);
    }
};

export default redis;