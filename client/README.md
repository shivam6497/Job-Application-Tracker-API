# Job Tracker Client

This is the frontend for the Job Application Tracker application built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- User authentication flow with login and registration
- Dashboard to view job applications by status
- Add, edit, and manage job entries
- Protected routes and secure API communication
- Responsive UI for desktop and mobile

## UI Preview

![Register Preview](./public/screenshots/register.png)

![Dashboard Preview](./public/screenshots/dashboard.png)

![Add-Job Preview](./public/screenshots/add-appilication.png)

<img width="1917" height="996" alt="Screenshot 2026-07-29 210428" src="https://github.com/user-attachments/assets/e84a4b72-8db9-4c1a-9b5d-d9db54e10907" />

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Project Structure

- src/app - main pages and route groups
- src/components - reusable UI components
- src/context - authentication context
- src/lib - shared client utilities
- src/types - shared frontend TypeScript types

## Environment Variables

Create a .env.local file and set:

```bash
NEXT_PUBLIC_URL=http://localhost:5000
```

## Scripts

- npm run dev - start development server
- npm run build - create production build
- npm run start - start production server
- npm run lint - run ESLint
