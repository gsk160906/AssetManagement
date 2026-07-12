import morgan from 'morgan';
import { env } from './env.js';

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () => (env.NODE_ENV === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - error: :message`;

export const morganSuccessHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => console.log(message.trim()) },
});

export const morganErrorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => console.error(message.trim()) },
});
