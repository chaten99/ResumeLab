import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, changeUserPassword, getUserCreditsData } from "../api/user.api";

export const USER_QUERY_KEYS = {
    profile: ["user", "profile"] as const,
    credits: ["user", "credits"] as const,
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
