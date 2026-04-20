# omkaarya-test-backend

Express + Postgres API for Omkaarya test project.

## Local development

- Install deps:

```bash
npm install
```

- Create `omkaarya-test-backend/.env` (see `.env.example`).
- Run migrations + seed:

```bash
npm run db:setup
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

