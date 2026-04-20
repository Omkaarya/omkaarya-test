# omkaarya-test

Monorepo layout:

- **`omkaarya-test/`** — Next.js frontend (deploy to Vercel from this folder).
- **`omkaarya-test-backend/`** — Express API (deploy separately, e.g. Docker / Render).

## Vercel (frontend)

### Two different fields (easy to mix up)

- **Project name** (e.g. "omkaarya-test") is only a label. It does **not** tell Vercel where the Next.js app lives.
- **Root Directory** (under **Settings → General**) must point at the folder that contains **`package.json` with `next` in it** and the **`app/`** directory.

### Which Root Directory value to use

Open your repo on GitHub and look at the **top level**:

| What you see at the repo root | Root Directory in Vercel |
|------------------------------|---------------------------|
| Folders `omkaarya-test/` and `omkaarya-test-backend/` (this monorepo) | **`omkaarya-test`** (the **inner** Next.js folder) |
| `app/`, `package.json` (with `next`), `next.config.*` — no nested `omkaarya-test` folder | **`.`** (leave blank / repository root). Do **not** set `omkaarya-test` or the path does not exist. |

If Root Directory is wrong for your actual Git layout, the deploy can look fine but the site returns **`404 NOT_FOUND`**.

The **repository root** of *this* clone is not the Next.js app: root `package.json` only holds a stray dependency; **`next` lives in `omkaarya-test/package.json`**.

### Other checks (same error)

1. **Settings → Build & Deployment → Build settings**: turn **off** any **Output Directory** override. Next.js on Vercel must use the default (do not set `dist`, `out`, etc.).
2. Open the deployment from the dashboard with **Visit** (use the URL Vercel assigns). Stale or mistyped `*.vercel.app` URLs can show NOT_FOUND.
3. Confirm the **Build** log contains a normal **`next build`** (compiled routes), not only `npm install` with no Next compile.

Also set environment variables in that project (see `omkaarya-test/.env.example`), especially `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_APP_URL`.
