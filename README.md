# Job Application Tracker API

A TypeScript + Express API for tracking job applications, managing authentication, caching job data in Redis, and scheduling follow-up emails with BullMQ.

## Features

- User registration, login, and logout with JWT authentication
- Protected CRUD endpoints for job applications
- Redis-backed caching for individual jobs and job lists
- Redis token blacklist for logout
- Rate limiting on auth endpoints
- BullMQ job queue for follow-up email reminders
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
- Resend

## Prerequisites

- Node.js installed
- MongoDB running or a valid MongoDB Atlas connection string
- Redis running locally or remotely
- A Resend API key for email delivery

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root using `.env.example` as a guide.

3. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following values:

```env
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET_KEY=
PORT=
RESEND_API_KEY=
RESEND_FROM=
```

## Scripts

- `npm run dev` - builds TypeScript and starts the server from `dist/index.js`
- `npm run build` - compiles TypeScript to `dist`
- `npm start` - runs the compiled server

## Project Structure

```text
src/
  cache/
  config/
  controllers/
  jobs/
  middleware/
  models/
  routes/
  validators/
  index.ts
```

## API Overview

Base URL: `/api`

### Auth Routes

#### `POST /api/auth/register`
Registers a new user.

Request body:

```json
{
  "name": "user",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

- Returns a JWT token
- Returns the created user details

#### `POST /api/auth/login`
Logs in an existing user.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/auth/logout`
Logs out the current user by blacklisting the token.

Requires:

- `Authorization: Bearer <token>`

### Job Routes

All job routes require authentication.

#### `POST /api/jobs`
Creates a new job application.

Request body:

```json
{
  "company": "Google",
  "role": "Frontend Developer",
  "status": "pending",
  "notes": "Applied through referral"
}
```

Valid `status` values:

- `pending`
- `interview`
- `declined`

#### `GET /api/jobs?page=1&limit=10`
Returns the authenticated user's job list.

#### `GET /api/jobs/:id`
Returns a single job by ID.

#### `PUT /api/jobs/:id`
Updates a job by ID.

#### `DELETE /api/jobs/:id`
Deletes a job by ID.

## Background Jobs

When a job is created, the API schedules a follow-up email reminder through BullMQ. The worker is started from `src/index.ts`, so it runs alongside the server process.

## Notes

- Auth routes use rate limiting.
- Job lists and individual jobs are cached in Redis.
- Logout blacklists the JWT token in Redis.
- Make sure the environment variables are set before starting the server.
