# omkaarya-test-backend

Express + Postgres API for Omkaarya test project.

## Local development

- Install deps:

```bash
npm install
```

- Create `omkaarya-test-backend/.env` (see `.env.example`).
- Run migrations (schema only):

```bash
npm run migrate
```

- Optionally load demo/reference data (manual — **not** run on `npm run dev`):

```bash
npm run seed
npm run seed:pricing-plans
```

Or both in one step for a fresh local DB:

```bash
npm run db:setup
npm run seed:pricing-plans
```

- Start dev server:

```bash
npm run dev
```

API mounts at `http://localhost:4000/api`.
Health check: `http://localhost:4000/health`.

## Deploy to Vercel (separate project)

Deploy this folder as its own Vercel project:

- **Root Directory**: `omkaarya-test-backend`
- **Build**: Vercel uses `vercel.json` + `api/index.ts` (Serverless Function)

### Routes

- API base: `https://<your-backend>.vercel.app/api`
- Health check: `https://<your-backend>.vercel.app/api/health`

### Required environment variables

- **DATABASE_URL**: Vercel Postgres connection string
- **CORS_ORIGIN**: the exact origin(s) of your frontend, comma-separated
  - Example: `https://your-frontend.vercel.app,https://your-frontend-git-main-<team>.vercel.app`
- **AUTO_MIGRATE**: set **`0`** in production (recommended for serverless)
- **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_API_SECRET**: required for temple branding image uploads
- **TEMPLE_OPS_PG_SUPERUSER_URL**: optional on Vercel+Neon — the app falls back to **`DATABASE_URL_UNPOOLED`** (direct connection injected by the Neon Storage integration). For local Postgres, set this to a `/postgres` maintenance URL with `CREATE DATABASE` rights.

Optional (email):

- `EMAIL_FROM`
- `SMTP_URL` (or discrete SMTP vars in `.env.example`)
- `PUBLIC_APP_URL` / `TEMPLE_ADMIN_SIGNIN_URL`

## Migrations on Vercel Postgres (recommended workflow)

Do **not** run migrations automatically on serverless request handlers/cold starts.

Use one of these:

### Option A: run migrations manually (simple)

From your machine:

```bash
cd omkaarya-test-backend
DATABASE_URL="postgres://..." npm run migrate
```

### Option B: run migrations in CI (safer for teams)

Add a GitHub Actions workflow that runs `npm ci` + `npm run migrate` with the Production `DATABASE_URL`
before/alongside deploying.

