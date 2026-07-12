export const corsConfig = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === 'http://localhost:5173' ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};