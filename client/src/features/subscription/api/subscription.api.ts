import api from "@/lib/axios";

export const getSubscriptionStatus = async () => {
    const response = await api.get("/subscription/status");
    return response.data;
};

export const startCheckout = async (planId: "PRO" | "PREMIUM") => {
    const response = await api.post("/subscription/checkout", { planId });
    return response.data;
};

export const verifySession = async (sessionId: string) => {
    const response = await api.post("/subscription/verify-session", { sessionId });
    return response.data;
};

export const getBillingHistory = async () => {
    const response = await api.get("/billing/history");
    return response.data;
};
