import { env } from '../config/env.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, ...args) => {
    if (levels[env.LOG_LEVEL] >= levels.info) {
      console.log(`[${getTimestamp()}] [INFO]: ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    if (levels[env.LOG_LEVEL] >= levels.error) {
      console.error(`[${getTimestamp()}] [ERROR]: ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (levels[env.LOG_LEVEL] >= levels.warn) {
      console.warn(`[${getTimestamp()}] [WARN]: ${message}`, ...args);
    }
  },
  debug: (message, ...args) => {
    if (levels[env.LOG_LEVEL] >= levels.debug) {
      console.debug(`[${getTimestamp()}] [DEBUG]: ${message}`, ...args);
    }
  },
};
export default logger;
