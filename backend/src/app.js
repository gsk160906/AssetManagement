import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { corsConfig } from './config/cors.js';
import { helmetConfig } from './config/helmet.js';
import { morganSuccessHandler, morganErrorHandler } from './config/morgan.js';
import router from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// HTTP Request logging
app.use(morganSuccessHandler);
app.use(morganErrorHandler);

// Security Headers
app.use(helmet(helmetConfig));

// CORS Configuration
app.use(cors(corsConfig));

// Response Compression
app.use(compression());

// Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files serving exports
app.use('/exports', express.static('public/exports'));
app.use('/uploads', express.static('public/uploads'));

// Mount all API routes
app.use(router);

// Handle 404 Not Found
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
