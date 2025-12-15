import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import coffeeRoutes from './routes/coffee.routes.js';
import teaRoutes from './routes/tea.routes.js';
import stageRoutes from './routes/stage.routes.js';
import cooperativeRoutes from './routes/cooperative.routes.js';
import processingRoutes from './routes/processing.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import exportRoutes from './routes/export.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import reportRoutes from './routes/report.routes.js';
import supplyChainRoutes from './routes/supplychain.routes.js';
import eventRoutes from './routes/events.routes.js';
import documentRoutes from './routes/documents.routes.js';
import mintRoutes from './routes/mint.routes.js';
import qrRoutes from './routes/qr.routes.js';
import ussdRoutes from './routes/ussd.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import communityRoutes from './routes/community.routes.js';
import statsRoutes from './routes/stats.routes.js';
import consumerRoutes from './routes/consumer.routes.js';

const createApp = (): Express => {
  const app = express();

  // Middleware
  // Middleware
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter((origin): origin is string => !!origin);

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use('/coffee', coffeeRoutes);
  app.use('/tea', teaRoutes);
  app.use('/stage', stageRoutes);
  app.use('/cooperatives', cooperativeRoutes);
  app.use('/processing', processingRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/exports', exportRoutes);
  app.use('/certificates', certificateRoutes);
  app.use('/reports', reportRoutes);
  app.use('/supplychain', supplyChainRoutes);
  app.use('/events', eventRoutes);
  app.use('/documents', documentRoutes);
  app.use('/mint', mintRoutes);

  // QR and Trace routes (includes public endpoints)
  app.use('/api', qrRoutes);

  // USSD gateway
  app.use('/api/ussd', ussdRoutes);

  // Notifications
  app.use('/notifications', notificationRoutes);

  // Community
  app.use('/community', communityRoutes);

  // Stats
  app.use('/stats', statsRoutes);

  // Consumer
  app.use('/api/consumer', consumerRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;

