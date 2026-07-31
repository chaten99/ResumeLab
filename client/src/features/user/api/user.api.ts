import api from "@/lib/axios";

export const getUserProfile = async () => {
    const response = await api.get("/user/profile");
    return response.data;
};

export const updateUserProfile = async (data: { name: string }) => {
    const response = await api.put("/user/profile", data);
    return response.data;
};

export const changeUserPassword = async (data: { currentPassword?: string; newPassword?: string }) => {
    const response = await api.post("/user/change-password", data);
    return response.data;
};

export const getUserCreditsData = async () => {
    const response = await api.get("/user/credits");
    return response.data;
};

export const getUserActivities = async () => {
    const response = await api.get("/user/activities");
    return response.data;
};

export const getUserNotifications = async () => {
    const response = await api.get("/user/notifications");
    return response.data;
};

export const markNotificationRead = async (id: string) => {
    const response = await api.patch(`/user/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.patch("/user/notifications/read-all");
    return response.data;
};

export const deleteNotification = async (id: string) => {
    const response = await api.delete(`/user/notifications/${id}`);
    return response.data;
};

export const exportUserData = async () => {
    const response = await api.post("/user/export-data");
    return response.data;
};

export const deactivateAccount = async () => {
    const response = await api.delete("/user/account");
    return response.data;
};
