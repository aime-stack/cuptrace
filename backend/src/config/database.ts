import { PrismaClient } from '@prisma/client';
import env from './env';

// Prevent multiple instances of Prisma Client in development
// This is important for hot reloading with nodemon to avoid
// "prepared statement already exists" errors
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

