import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { standardLimiter } from './middleware/rateLimiter.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import eventsRouter from './routes/events.js';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  const rawClientUrls = env.CLIENT_URL ? env.CLIENT_URL.split(',') : [];
  const configuredOrigins = rawClientUrls.map((u) => u.trim().replace(/\/+$/, '')).filter(Boolean);
  const staticAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, uptime monitors, or server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      const isConfigured = configuredOrigins.includes(cleanOrigin) || configuredOrigins.includes('*');
      const isStaticAllowed = staticAllowedOrigins.includes(cleanOrigin);

      let isVercelDomain = false;
      try {
        const parsedUrl = new URL(origin);
        isVercelDomain = parsedUrl.hostname.endsWith('.vercel.app') || parsedUrl.hostname === 'vercel.app';
      } catch {
        isVercelDomain = false;
      }

      if (isConfigured || isStaticAllowed || isVercelDomain) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by Planora CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Request body parsing with strict size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Basic request logger in development
  if (env.NODE_ENV === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  // Apply standard rate limiting to all /api routes
  app.use('/api', standardLimiter);

  // Health endpoints (supporting standard and versioned /v1 routes)
  app.use('/api/health', healthRouter);
  app.use('/api/v1/health', healthRouter);

  // Events & AI endpoints
  app.use('/api/events', eventsRouter);
  app.use('/api/v1/events', eventsRouter);

  // 404 Route Handler
  app.use('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export default createApp;
