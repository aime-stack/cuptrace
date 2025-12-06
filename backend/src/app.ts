import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import coffeeRoutes from './routes/coffee.routes';
import teaRoutes from './routes/tea.routes';
import stageRoutes from './routes/stage.routes';
import cooperativeRoutes from './routes/cooperative.routes';
import processingRoutes from './routes/processing.routes';
import paymentRoutes from './routes/payment.routes';
import exportRoutes from './routes/export.routes';
import certificateRoutes from './routes/certificate.routes';
import reportRoutes from './routes/report.routes';
import supplyChainRoutes from './routes/supplychain.routes';
import eventRoutes from './routes/events.routes';
import documentRoutes from './routes/documents.routes';

const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
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

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;

