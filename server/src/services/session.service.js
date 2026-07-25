import { randomUUID } from "crypto";
import redis from "../config/redis.js";
import { env } from "../config/env.js";
import { parseDuration } from "../utils/duration.js";

const SESSION_PREFIX = "auth:session:";

const SESSION_TTL_SECONDS =
    Math.floor(parseDuration(env.JWT_REFRESH_EXPIRES_IN) / 1000);

export const createSession = async (userId) => {
    const sessionId = randomUUID();
    const key = `${SESSION_PREFIX}${sessionId}`;

    await redis.set(
        key,
        userId.toString(),
        "EX",
        SESSION_TTL_SECONDS
    );

    return sessionId;
};

export const getSession = async (sessionId) => {
    return redis.get(`${SESSION_PREFIX}${sessionId}`);
};

export const deleteSession = async (sessionId) => {
    return redis.del(`${SESSION_PREFIX}${sessionId}`);
};