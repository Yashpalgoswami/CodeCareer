# CodeCareer

Production-ready MVP scaffold for a **Resume + Portfolio Showcase & Job Matcher** app.

## Stack

- **Backend:** Node.js, Express, SQLite
- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)

## Project Structure

- `/backend/src/routes` - API routes
- `/backend/src/controllers` - request handlers
- `/backend/src/services` - integrations + domain services
- `/backend/migrations` - SQLite schema migration scripts
- `/frontend/src` - app UI

## API Endpoints (MVP)

- `GET /api/auth/github` - start GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback + token persistence
- `GET /api/github/repos` - fetch repos (auth token or `username` query)
- `POST /api/resume/upload` - upload resume (`multipart/form-data`, field `resume`)
- `POST /api/match` - keyword overlap job matching

## Database Schema

Migration: `/backend/migrations/001_init.sql`

Tables:

- `users`
- `resumes`
- `portfolio_pages`
- `job_matches`

## Local Setup

1. Copy env file:
   ```bash
   cp .env.example backend/.env
   ```
2. Install dependencies:
   ```bash
   npm --prefix backend ci
   npm --prefix frontend ci
   ```
3. Run backend:
   ```bash
   npm --prefix backend run migrate
   npm --prefix backend run dev
   ```
4. Run frontend:
   ```bash
   npm --prefix frontend run dev
   ```

## Frontend MVP Screens

- GitHub OAuth login button
- Dashboard with repo fetch and resume skill entry
- Portfolio preview + shareable link
- Job match input and score/matched/missing output

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```

## Deployment Notes

- Deploy backend as a Node service (set all env vars from `.env.example`).
- Deploy frontend as static Vite build output (`frontend/dist`).
- Update `VITE_API_BASE_URL` to deployed backend URL.
