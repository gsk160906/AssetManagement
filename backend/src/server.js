import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './db/index.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  // Test connection to the Neon database pool
  try {
    await testConnection();
  } catch (error) {
    logger.warn('Neon database pool connection test failed. Starting server in degraded state...');
  }

  // Bind and listen to Express server port
  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
