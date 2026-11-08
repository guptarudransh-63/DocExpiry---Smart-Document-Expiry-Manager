# 📄 DocExpiry — Document Expiry Manager

A production-quality full-stack web application for managing personal documents, tracking expiry dates, and receiving automatic reminders.

## Features

- 🔐 **Secure Authentication** — JWT-based auth with password hashing
- 📁 **Document Management** — Upload, view, edit, delete, archive documents
- ⏰ **Expiry Tracking** — Automatic status calculation (Active, Expiring Soon, Expired)
- 🔔 **Smart Reminders** — Scheduled notifications at 30, 7, and 1 day before expiry
- 📧 **Email Notifications** — Configurable email alerts
- 🔍 **OCR Extraction** — Automatic document detail extraction from uploads
- 📊 **Dashboard** — Overview with summary cards, upcoming expiries, recent documents
- 🔒 **Security** — CORS, rate limiting, input validation, IDOR prevention

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File Storage | Cloudinary (with local fallback) |
| OCR | Tesseract.js |
| Email | Nodemailer |
| Scheduler | node-cron |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd "remainder system"
   ```

2. **Setup the backend**

   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your values
   npm install
   npm run dev
   ```

3. **Setup the frontend** (in a new terminal)

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open the app**

   Visit [http://localhost:5173](http://localhost:5173)

## Project Structure

```
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level pages
│   │   ├── layouts/       # Layout wrappers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service modules
│   │   ├── context/       # React Context providers
│   │   └── utils/         # Utility functions
│   └── ...
│
├── server/                # Express.js backend
│   ├── src/
│   │   ├── config/        # Database, env, constants
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── jobs/          # Scheduled cron jobs
│   │   └── utils/         # Utility classes
│   └── ...
│
└── docs/                  # API documentation
```

## API Endpoints

See [docs/api.md](docs/api.md) for full API documentation.

## Environment Variables

See [server/.env.example](server/.env.example) for all required environment variables.

## License

MIT
