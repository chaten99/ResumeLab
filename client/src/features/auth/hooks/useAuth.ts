import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setTokens, clearTokens } from "@/lib/tokenStorage";

import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
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
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      queryClient.clear();
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
      clearTokens();
      queryClient.clear();
    },
    onError: () => {
      clearTokens();
      queryClient.clear();
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmail,

    onSuccess: (data) => {
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      queryClient.clear();
      queryClient.setQueryData(authKeys.me, {
        success: true,
        user: data.user,
      });
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: resendVerification,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,

    onSuccess: () => {
      clearTokens();
      queryClient.clear();
    },
  });
};
