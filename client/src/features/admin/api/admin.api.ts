import api from "@/lib/axios";

export const getAdminOverview = async () => {
    const response = await api.get("/admin/overview");
    return response.data;
};

export const getAdminAnalytics = async () => {
    const response = await api.get("/admin/analytics");
    return response.data;
};

export const getAdminHealth = async () => {
    const response = await api.get("/admin/health");
    return response.data;
};

export const getAdminUsers = async (params: Record<string, any>) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
};

export const getAdminUserDetails = async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
};

export const disableUser = async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/disable`);
    return response.data;
};

export const enableUser = async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/enable`);
    return response.data;
};

export const verifyUserEmail = async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/verify-email`);
    return response.data;
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
    const response = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
    return response.data;
};

export const changeUserCredits = async (userId: string, data: { mode: string; amount: number; reason: string }) => {
    const response = await api.post(`/admin/users/${userId}/change-credits`, data);
    return response.data;
};

export const changeUserSubscription = async (userId: string, plan: string) => {
    const response = await api.post(`/admin/users/${userId}/change-subscription`, { plan });
    return response.data;
};

export const extendUserSubscription = async (userId: string, days: number) => {
    const response = await api.post(`/admin/users/${userId}/extend-subscription`, { days });
    return response.data;
};

export const expireUserSubscription = async (userId: string) => {
    const response = await api.post(`/admin/users/${userId}/expire-subscription`);
    return response.data;
};

export const getAdminResumes = async (params: Record<string, any>) => {
    const response = await api.get("/admin/resumes", { params });
    return response.data;
};

export const deleteAdminResume = async (resumeId: string) => {
    const response = await api.delete(`/admin/resumes/${resumeId}`);
    return response.data;
};

export const getAdminPayments = async () => {
    const response = await api.get("/admin/payments");
    return response.data;
};

export const getAdminCreditLedger = async (params?: Record<string, any>) => {
    const response = await api.get("/admin/credits/ledger", { params });
    return response.data;
};

export const getAdminAuditLogs = async () => {
    const response = await api.get("/admin/audit-logs");
    return response.data;
};
