import { useQuery, useMutation } from "@tanstack/react-query";
import { getSubscriptionStatus, startCheckout, verifySession, getBillingHistory } from "../api/subscription.api";

export const SUBSCRIPTION_QUERY_KEYS = {
    status: ["subscription", "status"] as const,
    billingHistory: ["billing", "history"] as const,
};

export const useCurrentSubscription = () => {
    return useQuery({
        queryKey: SUBSCRIPTION_QUERY_KEYS.status,
        queryFn: getSubscriptionStatus,
    });
};

export const useStartCheckout = () => {
    return useMutation({
        mutationFn: (planId: "PRO" | "PREMIUM") => startCheckout(planId),
    });
};

export const useVerifySession = () => {
    return useMutation({
        mutationFn: (sessionId: string) => verifySession(sessionId),
    });
};

export const useBillingHistory = () => {
    return useQuery({
        queryKey: SUBSCRIPTION_QUERY_KEYS.billingHistory,
        queryFn: getBillingHistory,
    });
};
