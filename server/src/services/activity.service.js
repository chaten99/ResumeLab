import Activity from "../models/activity.model.js";
import { emitToUser, emitToAdmin } from "../config/socket.js";
import logger from "../config/logger.js";

export const recordActivity = async ({ userId, type, description, metadata = {} }) => {
    try {
        const activity = await Activity.create({
            userId,
            type,
            description,
            metadata,
        });

        emitToUser(userId, "activity:created", activity);
        emitToAdmin("admin:telemetry", { type: "activity_created", activity });

        return activity;
    } catch (err) {
        logger.error({ err: err.message }, "Failed to record user activity");
        return null;
    }
};

export const getUserActivities = async (userId, limit = 20) => {
    return await Activity.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
};
