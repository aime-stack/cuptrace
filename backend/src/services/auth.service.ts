import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../config/database';
import { AuthenticationError, ValidationError } from '../utils/errors';
// UserRole will be available after Prisma client generation
// import { UserRole } from '@prisma/client';
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
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase().trim();

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
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      province: data.province?.trim() || null,
      country: data.country?.trim() || 'Rwanda',
      cooperativeId: data.cooperativeId || null,
      registrationNumber: data.registrationNumber?.trim() || null,
      isActive: true, // New users are active by default
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
  // Normalize email to lowercase
  const normalizedEmail = data.email.toLowerCase().trim();

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

