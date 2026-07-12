# AssetFlow ERP

AssetFlow ERP is a full-stack Enterprise Asset & Resource Management System built to streamline the complete lifecycle of organizational assets. It provides centralized asset management, maintenance tracking, resource booking, audit verification, reporting, notifications, and administrative controls through a modern web application.

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

### Backend
- Node.js
- Express.js
- PostgreSQL (Neon)
- JWT Authentication
- Zod Validation
- Cloudinary (Profile Images)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

---

# Features

- Secure JWT Authentication
- Dashboard & Analytics
- Asset Lifecycle Management
- Asset Allocation & Transfers
- Maintenance & Service Management
- Resource Booking Management
- Audit & Inventory Verification
- Reports & Export
- Notification Center
- User & Department Management
- Profile & Settings
- Role-Based Access Control
- Activity Logging
- Responsive UI
- Cloudinary Profile Image Upload

---

# Demo Login Credentials

The application already contains a pre-configured Administrator account.

Use the following credentials to log in:

| Field | Value |
|-------|-------|
| **Email** | admin@assetflow.com |
| **Password** | Admin@1234 |
| **Name** | System Admin |
| **Role** | ADMIN |
| **Employee Code** | EMP-000 |

After logging in as the Administrator, you can:

- Create employee accounts
- Manage departments
- Register assets
- Allocate assets
- Schedule maintenance
- Create bookings
- Perform inventory audits
- Generate reports
- Configure notifications
- Manage system settings

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/AssetFlow.git
```

---

## Backend

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=YOUR_DATABASE_URL

JWT_SECRET=YOUR_SECRET

JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Run backend

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Run frontend

```bash
npm run dev
```

---

# Default Administrator

A default Administrator account is already available.

There is **no public user registration**.

New users and employees can only be created by an authenticated Administrator through the User Management module.

---

# Project Modules

- Authentication
- Dashboard
- Assets
- Asset Allocation
- Maintenance
- Resource Booking
- Audit & Inventory Verification
- Reports & Export
- Notifications
- Departments
- Profile & Settings

---

# Live Demo

Frontend:
```
https://your-vercel-app.vercel.app
```

Backend:
```
https://your-render-backend.onrender.com
```

---

# License

This project was developed for educational and demonstration purposes.
