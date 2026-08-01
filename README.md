# Job Tracker

A clean, minimal job application tracker built for developers. Track every application from first apply to final offer — with status updates, notes, search, and follow-up reminders.

## UI

<img width="1917" height="996" alt="Screenshot 2026-07-29 210428" src="https://github.com/user-attachments/assets/e84a4b72-8db9-4c1a-9b5d-d9db54e10907" />

<img width="1917" height="996" alt="Screenshot 2026-07-29 210113" src="https://github.com/user-attachments/assets/bd869c97-a76a-4353-a28b-e95f39dc791e" />

<img width="1917" height="997" alt="Screenshot 2026-07-29 210243" src="https://github.com/user-attachments/assets/3d8b0342-1ab3-4ae6-a12b-b5bc2babde3e" />

<img width="1917" height="992" alt="Screenshot 2026-07-29 210349" src="https://github.com/user-attachments/assets/f64bea19-2570-41ed-ad25-53990b37865d" />

---

## Features

- **Application tracking** — add jobs with company, role, status, notes, and applied date
- **Status management** — Applied, Interview, Offer, Rejected
- **Stats overview** — see your numbers at a glance on the dashboard
- **Filter by status** — quickly narrow down applications
- **Search** — find any application by company or role name
- **Follow-up reminders** — automatic email reminders via BullMQ job queue
- **JWT authentication** — access token in memory + httpOnly refresh token cookie
- **Token blacklisting** — secure logout via Redis
- **Redis caching** — fast job list and single job reads
- **Pagination** — clean paginated job list

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| Redis (Upstash) | Caching + token blacklist |
| BullMQ | Email job queue |
| Resend | Transactional emails |
| JWT | Authentication |
| Zod | Request validation |
| dotenvx | Environment management |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| Axios | HTTP client with interceptors |

---

## Architecture

```
client/                   # Next.js frontend
└── src/
    ├── app/
    │   ├── (auth)/       # Login, Register pages
    │   ├── (main)/       # Protected pages — Dashboard, Jobs
    │   └── page.tsx      # Landing page
    ├── components/       # Shared components
    ├── context/          # Auth context
    ├── lib/              # Axios instance + interceptors
    └── types/            # TypeScript types

Server/                   # Express backend
└── src/
    ├── config/           # DB + Redis connection
    ├── controllers/      # Auth + Job controllers
    ├── middleware/        # Auth, error, validation
    ├── models/           # Mongoose models
    ├── routes/           # Express routers
    ├── cache/            # Redis cache helpers
    ├── jobs/             # BullMQ email queue + worker
    └── validators/       # Zod schemas
```

---

## API Endpoints

### Auth
```
POST /api/v1/auth/register   → { accessToken, user }
POST /api/v1/auth/login      → { accessToken, user } + sets refreshToken cookie
POST /api/v1/auth/logout     → clears cookie, blacklists token
POST /api/v1/auth/refresh    → { accessToken, user }
```

### Jobs
```
GET    /api/v1/jobs           → { jobs, total } (supports ?page, ?limit, ?status, ?search)
GET    /api/v1/jobs/stats     → { stats: { Applied, Interview, Offer, Rejected } }
GET    /api/v1/jobs/:id       → { job }
POST   /api/v1/jobs           → { job }
PUT    /api/v1/jobs/:id       → { job }
DELETE /api/v1/jobs/:id       → { success }
```

---

## Auth Flow

```
Register/Login
  → accessToken (15m) stored in window.__accessToken (in-memory)
  → refreshToken (7d) stored in httpOnly cookie

Every request
  → Axios interceptor attaches Authorization: Bearer <token>

On 401
  → Interceptor hits POST /api/v1/auth/refresh
  → New accessToken stored in memory
  → Original request retried

Logout
  → POST /api/v1/auth/logout
  → Token blacklisted in Redis
  → Cookie cleared
  → window.__accessToken = null
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Upstash Redis account
- Resend account (for emails)

### Backend Setup

```bash
cd Server
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET_KEY=your_jwt_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
REDIS_URL=your_upstash_redis_url
RESEND_API_KEY=your_resend_api_key
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Job Status Flow

```
Applied → Interview → Offer
                   ↘ Rejected
```

---

## Caching Strategy

- Single job cached for **1 hour** after first DB read
- Job list cached for **5 minutes** per `page:limit:status:search` combination
- Cache invalidated on create, update, delete
- Token blacklist stored in Redis with TTL matching token expiry

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render  |
| Database | MongoDB Atlas |
| Redis | Upstash |
| Emails | Resend |

---

