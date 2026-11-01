import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 [Planora Server]: Running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🌐 [Health Check]: http://localhost:${env.PORT}/api/health`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
