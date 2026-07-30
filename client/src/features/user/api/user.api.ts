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
