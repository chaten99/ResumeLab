import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAdminOverview,
    getAdminAnalytics,
    getAdminHealth,
    getAdminUsers,
    getAdminUserDetails,
    disableUser,
    enableUser,
    verifyUserEmail,
    resetUserPassword,
    changeUserCredits,
    changeUserSubscription,
    extendUserSubscription,
    expireUserSubscription,
    getAdminResumes,
    deleteAdminResume,
    getAdminPayments,
    getAdminCreditLedger,
    getAdminAuditLogs,
} from "../api/admin.api";

export const ADMIN_QUERY_KEYS = {
    overview: ["admin", "overview"] as const,
    analytics: ["admin", "analytics"] as const,
    health: ["admin", "health"] as const,
    users: (params: Record<string, any>) => ["admin", "users", params] as const,
    userDetails: (id: string) => ["admin", "user", id] as const,
    resumes: (params: Record<string, any>) => ["admin", "resumes", params] as const,
    payments: ["admin", "payments"] as const,
    ledger: (params?: Record<string, any>) => ["admin", "ledger", params] as const,
    auditLogs: ["admin", "auditLogs"] as const,
};

export const useAdminOverview = () => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.overview,
        queryFn: getAdminOverview,
    });
};

export const useAdminAnalytics = () => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.analytics,
        queryFn: getAdminAnalytics,
    });
};

export const useAdminHealth = () => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.health,
        queryFn: getAdminHealth,
    });
};

export const useAdminUsers = (params: Record<string, any>) => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.users(params),
        queryFn: () => getAdminUsers(params),
    });
};

export const useAdminUserDetails = (userId: string) => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.userDetails(userId),
        queryFn: () => getAdminUserDetails(userId),
        enabled: !!userId,
    });
};

export const useDisableUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => disableUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useEnableUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => enableUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useVerifyUserEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => verifyUserEmail(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useResetUserPassword = () => {
    return useMutation({
        mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
            resetUserPassword(userId, newPassword),
    });
};

export const useChangeUserCredits = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: { mode: string; amount: number; reason: string } }) =>
            changeUserCredits(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useChangeUserSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, plan }: { userId: string; plan: string }) =>
            changeUserSubscription(userId, plan),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useExtendUserSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, days }: { userId: string; days: number }) =>
            extendUserSubscription(userId, days),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useExpireUserSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => expireUserSubscription(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useAdminResumes = (params: Record<string, any>) => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.resumes(params),
        queryFn: () => getAdminResumes(params),
    });
};

export const useDeleteAdminResume = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (resumeId: string) => deleteAdminResume(resumeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
    });
};

export const useAdminPayments = () => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.payments,
        queryFn: getAdminPayments,
    });
};

export const useAdminCreditLedger = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.ledger(params),
        queryFn: () => getAdminCreditLedger(params),
    });
};

export const useAdminAuditLogs = () => {
    return useQuery({
        queryKey: ADMIN_QUERY_KEYS.auditLogs,
        queryFn: getAdminAuditLogs,
    });
};
