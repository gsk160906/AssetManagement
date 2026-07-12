import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { MESSAGES } from '../constants/messages.js';

const { Pool } = pg;

// Neon database pools require SSL configurations.
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' || env.DATABASE_URL.includes('sslmode=require') || env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info(`✓ Database Connected`);
    client.release();
    return true;
  } catch (error) {
    logger.error(`${MESSAGES.DATABASE_CONNECTION_ERROR}: ${error.message}`);
    // We throw the error so that server startup can handle or log it appropriately
    throw error;
  }
};

export default pool;
