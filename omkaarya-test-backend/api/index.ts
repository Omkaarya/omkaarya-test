import { createApp } from "../src/app.js";
import { runPendingMigrations } from "../src/db/run-migrations.js";
import type { IncomingMessage, ServerResponse } from "node:http";

// Run migrations once on cold start (Vercel serverless).
// Skips already-applied files, so it's safe to run on every deploy.
const migrationReady = runPendingMigrations()
  .then(() => console.log("[db] Migrations complete"))
  .catch((e) => {
    console.error("[db] Migration failed on cold start:", e);
    throw e;
  });

// Same mount as local server: `/api/temples`, `/api/login`, … (not `/temples` at repo root).
const app = createApp({ apiMountPath: "/api" });

// Wrapper that waits for migrations before handling any request.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await migrationReady;
    app(req, res);
  } catch {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "MIGRATIONS_FAILED",
          message: "Service unavailable",
          reason: "Database migrations did not complete successfully.",
        },
      })
    );
  }
}
