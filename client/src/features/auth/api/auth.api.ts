import api from "@/lib/axios";

import type {
    AuthResponse,
    LoginInput,
    MeResponse,
    MessageResponse,
    RegisterInput,
} from "../types/auth.types";

export const registerUser = async (
    data: RegisterInput
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
        "/auth/register",
        data
    );

    return response.data;
};

export const loginUser = async (
    data: LoginInput
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
        "/auth/login",
        data
    );

    return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>(
        "/auth/me"
    );

    return response.data;
};

export const refreshAccessToken =
    async (): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            "/auth/refresh-token"
        );

        return response.data;
    };

export const logoutUser =
    async (): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>(
            "/auth/logout"
        );

        return response.data;
    };