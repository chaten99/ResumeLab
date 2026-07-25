import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getMe,
    loginUser,
    logoutUser,
    registerUser,
} from "../api/auth.api";

export const authKeys = {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: getMe,
        retry: false,
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerUser,

        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.me, {
                success: true,
                user: data.user,
            });
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginUser,

        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.me, {
                success: true,
                user: data.user,
            });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutUser,

        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: authKeys.all,
            });
        },
    });
};