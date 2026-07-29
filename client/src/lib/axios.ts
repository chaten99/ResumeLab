import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

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

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
    await refreshApi.post("/auth/refresh-token");
};

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/resend-verification",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh-token",
    "/dev/verify-email",
];

const isPublicAuthEndpoint = (url?: string) => {
    if (!url) return false;
    return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        if (axios.isCancel(error) || error.name === "CanceledError") {
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

            await refreshPromise;

            return api(originalRequest);
        } catch {
            return Promise.reject(error);
        }
    }
);

export default api;