import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    getUserCreditsData,
    getUserActivities,
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    exportUserData,
    deactivateAccount,
} from "../api/user.api";

export const USER_QUERY_KEYS = {
    profile: ["user", "profile"] as const,
    credits: ["user", "credits"] as const,
    activities: ["user", "activities"] as const,
    notifications: ["user", "notifications"] as const,
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.profile,
        queryFn: getUserProfile,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changeUserPassword,
    });
};

export const useUserCredits = () => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.credits,
        queryFn: getUserCreditsData,
    });
};

export const useUserActivities = () => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.activities,
        queryFn: getUserActivities,
    });
};

export const useUserNotifications = () => {
    return useQuery({
        queryKey: USER_QUERY_KEYS.notifications,
        queryFn: getUserNotifications,
        staleTime: Infinity,
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markNotificationRead,
        onSuccess: (_res, id) => {
            queryClient.setQueryData(USER_QUERY_KEYS.notifications, (oldData: any) => {
                if (!oldData) return oldData;
                const newUnread = Math.max(0, (oldData.unreadCount || 1) - 1);
                return {
                    notifications: oldData.notifications?.map((n: any) =>
                        n._id === id ? { ...n, read: true } : n
                    ),
                    unreadCount: newUnread,
                };
            });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.setQueryData(USER_QUERY_KEYS.notifications, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    notifications: oldData.notifications?.map((n: any) => ({ ...n, read: true })),
                    unreadCount: 0,
                };
            });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: (_res, id) => {
            queryClient.setQueryData(USER_QUERY_KEYS.notifications, (oldData: any) => {
                if (!oldData) return oldData;
                const deletedItem = oldData.notifications?.find((n: any) => n._id === id);
                const wasUnread = deletedItem && !deletedItem.read;
                const newUnread = wasUnread ? Math.max(0, oldData.unreadCount - 1) : oldData.unreadCount;
                return {
                    notifications: oldData.notifications?.filter((n: any) => n._id !== id),
                    unreadCount: newUnread,
                };
            });
        },
    });
};

export const useExportUserData = () => {
    return useMutation({
        mutationFn: exportUserData,
    });
};

export const useDeactivateAccount = () => {
    return useMutation({
        mutationFn: deactivateAccount,
    });
};
