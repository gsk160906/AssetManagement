# AssetFlow Backend API

This is the backend API server for **AssetFlow**—an Enterprise Asset & Resource Management System (ERP).

## Tech Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL (hosted on Neon)
- **Database Driver:** `pg`
- **Security:** `helmet`, `cors`
- **Logging:** `morgan`
- **Validation:** `zod`
- **Compression:** `compression`

## Directory Structure
```text
src/
├── config/         # Environment, CORS, helmet, and morgan logging configurations
├── constants/      # HTTP status codes and response messages
├── db/             # Database connection pool and ping checks
├── middlewares/    # errorHandler, notFound, and zod request validation middlewares
├── modules/        # Modular ERP feature modules (empty placeholders)
├── routes/         # Router registry (V1 endpoints and health check paths)
├── utils/          # Logger helpers, standard response builders, async handlers
└── server.js       # Node server entry point
```

## Running Locally

1. Create a `.env` file from `.env.example` (pre-created with defaults):
   ```bash
   cp .env.example .env
   ```
2. Configure your Neon PostgreSQL connection string in `DATABASE_URL`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (with nodemon):
   ```bash
   npm run dev
   ```
5. Run the production start command:
   ```bash
   npm start
   ```

## Core API Endpoints

- **Root API Status:** `GET http://localhost:5000/`
- **System Health Check:** `GET http://localhost:5000/health`
