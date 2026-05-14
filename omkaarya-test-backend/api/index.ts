import { createApp } from "../src/app.js";
import { runPendingMigrations } from "../src/db/run-migrations.js";
import { runOpsAuthMirrorUserIdMigration } from "../src/db/run-ops-auth-mirror-migration.js";
import type { IncomingMessage, ServerResponse } from "node:http";

// Run platform SQL migrations + best-effort ops auth mirror UUID pass once per cold start (Vercel serverless).
// Both are idempotent / safe to run on every deploy.
const migrationReady = runPendingMigrations()
  .then(async () => {
    console.log("[db] Platform migrations complete");
    try {
      await runOpsAuthMirrorUserIdMigration();
    } catch (e) {
      console.warn("[db] Ops auth mirror UUID pass failed (non-fatal; API will still start):", e);
    }
  })
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
