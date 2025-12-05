import { z } from 'zod';
import { UserRole } from '@/types';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRole),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().default('Rwanda'),
    cooperativeId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine((data) => {
    // Farmers must have a cooperative, but allow other roles to register without one
    if (data.role === UserRole.farmer) {
        return !!data.cooperativeId && data.cooperativeId.trim().length > 0;
    }
    return true;
}, {
    message: 'Farmers must be associated with a cooperative',
    path: ['cooperativeId'],
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
