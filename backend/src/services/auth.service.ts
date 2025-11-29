import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/database';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';
import { normalizeEmail, sanitizeString, isValidEmail } from '../utils/validation';
import { normalizePagination, createPaginationResult } from '../utils/pagination';

type UserRole = 'farmer' | 'ws' | 'factory' | 'exporter' | 'importer' | 'retailer' | 'admin';

const SALT_ROUNDS = 10;

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  cooperativeId?: string;
  registrationNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
  );
};

export const verifyToken = (token: string): { userId: string; email: string } => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Validate and normalize email
  if (!isValidEmail(data.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  const normalizedEmail = normalizeEmail(data.email);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Validate role-specific requirements
  if (data.role === 'farmer' && !data.cooperativeId) {
    throw new ValidationError('Farmers must be associated with a cooperative');
  }

  // Validate cooperative exists if provided
  if (data.cooperativeId) {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: data.cooperativeId },
    });

    if (!cooperative) {
      throw new ValidationError('Cooperative not found');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: sanitizeString(data.name) || data.name,
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      phone: sanitizeString(data.phone),
      address: sanitizeString(data.address),
      city: sanitizeString(data.city),
      province: sanitizeString(data.province),
      country: sanitizeString(data.country) || 'Rwanda',
      cooperativeId: data.cooperativeId || null,
      registrationNumber: sanitizeString(data.registrationNumber),
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user,
    token,
  };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  // Validate and normalize email
  if (!isValidEmail(data.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  const normalizedEmail = normalizeEmail(data.email);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated. Please contact administrator.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Get current user profile
 * @param userId - User ID from token
 * @returns User profile data
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      province: true,
      country: true,
      registrationNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account is deactivated');
  }

  return user;
};

/**
 * List users with pagination and filters
 */
export const listUsers = async (
  page: number = 1,
  limit: number = 10,
  role?: UserRole,
  isActive?: boolean,
  cooperativeId?: string
) => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (cooperativeId) {
    where.cooperativeId = cooperativeId;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        province: true,
        country: true,
        isActive: true,
        createdAt: true,
        cooperative: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return createPaginationResult(users, total, pagination.page, pagination.limit);
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      province: true,
      country: true,
      registrationNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
          description: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    cooperativeId?: string;
    registrationNumber?: string;
  }
) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    throw new NotFoundError('User not found');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updateData.name = sanitizeString(data.name) || data.name;
  }

  if (data.phone !== undefined) {
    updateData.phone = sanitizeString(data.phone);
  }

  if (data.address !== undefined) {
    updateData.address = sanitizeString(data.address);
  }

  if (data.city !== undefined) {
    updateData.city = sanitizeString(data.city);
  }

  if (data.province !== undefined) {
    updateData.province = sanitizeString(data.province);
  }

  if (data.country !== undefined) {
    updateData.country = sanitizeString(data.country) || data.country;
  }

  if (data.cooperativeId !== undefined) {
    if (data.cooperativeId) {
      // Validate cooperative exists
      const cooperative = await prisma.cooperative.findUnique({
        where: { id: data.cooperativeId },
      });

      if (!cooperative) {
        throw new NotFoundError('Cooperative not found');
      }
    }
    updateData.cooperativeId = data.cooperativeId || null;
  }

  if (data.registrationNumber !== undefined) {
    updateData.registrationNumber = sanitizeString(data.registrationNumber);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      city: true,
      province: true,
      country: true,
      registrationNumber: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      cooperative: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  return user;
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId: string) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isActive) {
    throw new ValidationError('User is already deactivated');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return updated;
};

/**
 * Activate user
 */
export const activateUser = async (userId: string) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isActive) {
    throw new ValidationError('User is already active');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return updated;
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  if (!currentPassword) {
    throw new ValidationError('Current password is required');
  }

  if (!newPassword) {
    throw new ValidationError('New password is required');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('New password must be at least 8 characters');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return { message: 'Password changed successfully' };
};

/**
 * Reset user password (admin only)
 */
export const resetPassword = async (userId: string, newPassword: string) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  if (!newPassword) {
    throw new ValidationError('New password is required');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return { message: 'Password reset successfully' };
};

