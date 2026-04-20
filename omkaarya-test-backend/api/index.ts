import { createApp } from "../src/app.js";
import { runPendingMigrations } from "../src/db/run-migrations.js";
import type { IncomingMessage, ServerResponse } from "node:http";

// Run migrations once on cold start (Vercel serverless).
// Skips already-applied files, so it's safe to run on every deploy.
const migrationReady = runPendingMigrations()
  .then(() => console.log("[db] Migrations complete"))
  .catch((e) => console.error("[db] Migration failed on cold start:", e));

const app = createApp({ apiMountPath: "/" });

// Wrapper that waits for migrations before handling any request.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await migrationReady;
  app(req, res);
}