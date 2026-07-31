import Notification from "../models/notification.model.js";
import { emitToUser } from "../config/socket.js";
import logger from "../config/logger.js";

export const createInAppNotification = async ({ userId, title, message, type = "info" }) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
        });

        const unreadCount = await Notification.countDocuments({ userId, read: false });

        const payload = {
            notification: {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                read: notification.read,
                createdAt: notification.createdAt,
            },
            unreadCount,
        };

        emitToUser(userId, "notification:new", payload);

        return notification;
    } catch (err) {
        logger.error({ err: err.message }, "Failed to create in-app notification");
        return null;
    }
};

export const getUserNotifications = async (userId, limit = 50) => {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return { notifications, unreadCount };
};

export const markNotificationAsRead = async (userId, notificationId) => {
    const updated = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { read: true } },
        { new: true }
    );
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    emitToUser(userId, "notification:updated", {
        notificationId,
        read: true,
        unreadCount,
    });

    return updated;
};

export const markAllNotificationsAsRead = async (userId) => {
    const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

    emitToUser(userId, "notification:updated", {
        allRead: true,
        unreadCount: 0,
    });

    return result;
};

export const deleteNotification = async (userId, notificationId) => {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId });
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    emitToUser(userId, "notification:deleted", {
        notificationId,
        unreadCount,
    });

    return deleted;
};
