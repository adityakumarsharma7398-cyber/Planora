import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      geminiConfigured: env.isGeminiConfigured,
      geminiModel: env.GEMINI_MODEL,
      supabaseConfigured: env.isSupabaseConfigured,
    },
    system: {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
    },
  });
});

export default router;
