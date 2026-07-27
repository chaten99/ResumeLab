import { randomUUID } from "crypto";

import redis from "../config/redis.js";
import { env } from "../config/env.js";
import { parseDuration } from "../utils/duration.js";

const SESSION_PREFIX = "auth:session:";
const USER_SESSIONS_PREFIX = "auth:user-sessions:";

const SESSION_TTL_SECONDS = Math.floor(
    parseDuration(env.JWT_REFRESH_EXPIRES_IN) / 1000
);

export const createSession = async (userId) => {
    const sessionId = randomUUID();

    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;

    await redis
        .multi()
        .set(
            sessionKey,
            userId.toString(),
            "EX",
            SESSION_TTL_SECONDS
        )
        .sadd(userSessionsKey, sessionId)
        .expire(userSessionsKey, SESSION_TTL_SECONDS)
        .exec();

    return sessionId;
};

export const getSession = async (sessionId) => {
    return redis.get(`${SESSION_PREFIX}${sessionId}`);
};

export const deleteSession = async (sessionId) => {
    const sessionKey = `${SESSION_PREFIX}${sessionId}`;

    const userId = await redis.get(sessionKey);

    if (!userId) {
        return;
    }

    await redis
        .multi()
        .del(sessionKey)
        .srem(
            `${USER_SESSIONS_PREFIX}${userId}`,
            sessionId
        )
        .exec();
};

export const deleteAllUserSessions = async (userId) => {
    const userSessionsKey =
        `${USER_SESSIONS_PREFIX}${userId}`;

    const sessionIds = await redis.smembers(
        userSessionsKey
    );

    if (sessionIds.length === 0) {
        await redis.del(userSessionsKey);
        return;
    }

    const pipeline = redis.multi();

    for (const sessionId of sessionIds) {
        pipeline.del(
            `${SESSION_PREFIX}${sessionId}`
        );
    }

    pipeline.del(userSessionsKey);

    await pipeline.exec();
};