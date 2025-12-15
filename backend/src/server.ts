import env from './config/env';
import createApp from './app';
import prisma from './config/database';

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 CupTrace Backend Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await prisma.$disconnect();
      console.log('Prisma client disconnected');
    } catch (error) {
      console.error('Error disconnecting Prisma client:', error);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;

