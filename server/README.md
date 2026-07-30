# Job Application Tracker API

This is the backend for the Job Application Tracker app. It is built with Express and TypeScript and provides authenticated job tracking, Redis caching, JWT refresh handling, and email reminder jobs.

## Features

- User registration, login, logout, and token refresh with JWT
- Protected CRUD endpoints for job applications
- Job listing with pagination, filtering, and search support
- Job statistics endpoint for dashboard summaries
- Redis-backed caching for job details and job lists
- Redis-based blacklist for revoked access/refresh tokens
- Rate limiting on authentication routes
- Background email reminder jobs using BullMQ
- MongoDB persistence with Mongoose

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- Redis + ioredis
- BullMQ
- JWT
- Zod
- CORS + cookie-parser
- Jest + Supertest

## Prerequisites

- Node.js 18+
- MongoDB running locally or a valid MongoDB Atlas connection string
- Redis running locally or remotely
- A Resend API key if email delivery is enabled

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the server root.

3. Start the development server:

```bash
npm run dev
```

## Environment Variables

Example variables used by the server:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://127.0.0.1:27017/job-tracker
JWT_SECRET_KEY=your-access-secret
JWT_REFRESH_SECRET_KEY=your-refresh-secret
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
RESEND_API_KEY=your-resend-key
RESEND_FROM=your-email
```

## Scripts

- `npm run dev` - compiles TypeScript and starts the server
- `npm run build` - compiles the project to `dist`
- `npm start` - runs the built server from `dist/server.js`
- `npm test` - runs the Jest test suite

## Project Structure

```text
src/
  cache/          # Redis cache helpers
  config/         # DB, Redis, mailer configuration
  controllers/    # Request handlers for auth and jobs
  jobs/           # BullMQ worker and queue logic
  middleware/     # Auth, validation, error, and rate limiting
  models/         # Mongoose schemas/models
  routes/         # Express route definitions
  validators/     # Zod validation schemas
  index.ts        # Express app setup
  server.ts       # Server bootstrap
```

## API Overview

Base URL: `/api/v1`

### Authentication

#### `POST /api/v1/auth/register`

Creates a new user account and returns an access token plus user details.

Request body:

```json
{
  "name": "user",
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/v1/auth/login`

Authenticates a user and returns a new access token.

#### `POST /api/v1/auth/refresh`

Refreshes the access token using the HTTP-only refresh cookie.

#### `POST /api/v1/auth/logout`

Logs the user out and blacklists the active tokens in Redis.

### Jobs

All job routes require authentication.

#### `POST /api/v1/jobs`

Create a new job application.

Request body:

```json
{
  "company": "Google",
  "role": "Frontend Developer",
  "status": "Applied",
  "notes": "Applied through referral",
  "appliedDate": "2026-07-30"
}
```

Valid statuses:

- `Applied`
- `Interview`
- `Offer`
- `Rejected`

#### `GET /api/v1/jobs?page=1&limit=10`

Get paginated jobs for the authenticated user.

#### `GET /api/v1/jobs/stats`

Get job counts grouped by status.

#### `GET /api/v1/jobs/:id`

Get one job by ID.

#### `PUT /api/v1/jobs/:id`

Update one job by ID.

#### `DELETE /api/v1/jobs/:id`

Delete one job by ID.

## Health Check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

## Testing

Run the test suite:

```bash
npm test
```

## Notes

- Authentication uses rate limiting on login/register routes.
- Job data is cached in Redis for faster reads.
- Logout revokes tokens by storing them in Redis.
- The server also starts a BullMQ worker for follow-up email jobs.
