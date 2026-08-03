import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    const response = await refreshApi.post("/auth/refresh-token", { refreshToken });
    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken;
    if (newAccessToken) {
        setTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
    }
    return null;
};

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/resend-verification",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
];

const isPublicAuthEndpoint = (url?: string) => {
    if (!url) return false;
    return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        if (axios.isCancel(error) || error.name === "CanceledError") {
            return Promise.reject(error);
        }

        if (error.response?.status === 402) {
            const data = error.response?.data as any;
            window.dispatchEvent(
                new CustomEvent("credits:insufficient", {
                    detail: {
                        message: data?.message || "Insufficient credits.",
                        requiredCredits: data?.requiredCredits,
                        currentCredits: data?.currentCredits,
                    },
                })
            );
            return Promise.reject(error);
        }

        const originalRequest = error.config as
            | RetryRequestConfig
            | undefined;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isPublicAuthEndpoint(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
            }

            const newAccessToken = await refreshPromise;

            if (newAccessToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return api(originalRequest);
        } catch (refreshErr) {
            clearTokens();
            return Promise.reject(refreshErr);
        }
    }
);

export default api;