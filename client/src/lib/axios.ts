import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

interface RetryRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
    await refreshApi.post("/auth/refresh-token");
};

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as
            | RetryRequestConfig
            | undefined;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
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
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;