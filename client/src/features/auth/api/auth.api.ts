import api from "@/lib/axios";

import type {
  AuthResponse,
  LoginInput,
  MeResponse,
  MessageResponse,
  RegisterInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../types/auth.types";

export const registerUser = async (
  data: RegisterInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get<MeResponse>("/auth/me");

  return response.data;
};

export const refreshAccessToken = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/refresh-token");

  return response.data;
};

export const logoutUser = async (): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/auth/logout");

  return response.data;
};

export const verifyEmail = async (
  data: VerifyEmailInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/verify-email", data);

  return response.data;
};

export const resendVerification = async (
  data: ResendVerificationInput,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/resend-verification",
    data,
  );

  return response.data;
};

export const forgotPassword = async (
  data: ForgotPasswordInput,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/forgot-password",
    data,
  );

  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordInput,
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>(
    "/auth/reset-password",
    data,
  );

  return response.data;
};

export const devBypassVerifyEmail = async (
  email: string,
  secret: string
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>("/dev/verify-email", {
    email,
    secret,
  });

  return response.data;
};
