import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, STORAGE_KEYS } from './constants';

export const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            // Don't redirect on auth pages (login, register) or if already on login
            if (typeof window !== 'undefined') {
                // Clear cookies to prevent middleware from redirecting back to protected routes
                document.cookie = 'cuptrace_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = 'cuptrace_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

                const authPages = ['/login', '/register', '/forgot-password'];
                const isAuthPage = authPages.some(page => window.location.pathname.includes(page));
                if (!isAuthPage) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
