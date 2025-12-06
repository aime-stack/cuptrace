import { axiosInstance } from '@/lib/axios';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    AuthResponse,
    User,
    ApiResponse
} from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

// Helper to set cookie
const setCookie = (name: string, value: string, days = 7) => {
    if (typeof window !== 'undefined') {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
    }
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
    if (typeof window !== 'undefined') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
};

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (data.data) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));

        // Set cookies for middleware
        setCookie('cuptrace_token', data.data.token);
        setCookie('cuptrace_role', data.data.user.role);

        return data.data;
    }
    throw new Error(data.message || 'Login failed');
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (data.data) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));

        // Set cookies for middleware
        setCookie('cuptrace_token', data.data.token);
        setCookie('cuptrace_role', data.data.user.role);

        return data.data;
    }
    throw new Error(data.message || 'Registration failed');
};

export const getCurrentUser = async (): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    if (data.data) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data));
        return data.data;
    }
    throw new Error(data.message || 'Failed to fetch user');
};

export const logout = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);

    // Remove cookies
    deleteCookie('cuptrace_token');
    deleteCookie('cuptrace_role');

    window.location.href = '/login';
};

export const listUsers = async (params?: { role?: string; search?: string }): Promise<User[]> => {
    const { data } = await axiosInstance.get<ApiResponse<User[]>>('/auth/users', { params });
    return data.data || [];
};

export const getUserById = async (id: string): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>(`/auth/users/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'User not found');
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
    const { data } = await axiosInstance.put<ApiResponse<User>>(`/auth/users/${id}`, userData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update user');
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.post('/auth/change-password', { oldPassword, newPassword });
};

export const deactivateUser = async (id: string): Promise<void> => {
    await axiosInstance.post(`/auth/users/${id}/deactivate`);
};

export const activateUser = async (id: string): Promise<void> => {
    await axiosInstance.post(`/auth/users/${id}/activate`);
};

export const resetPassword = async (id: string): Promise<void> => {
    await axiosInstance.post(`/auth/users/${id}/reset-password`);
};
