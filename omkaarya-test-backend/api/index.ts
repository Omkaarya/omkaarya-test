import { createApp } from "../src/app.js";
import { runPendingMigrations } from "../src/db/run-migrations.js";

// Run migrations once on cold start (Vercel serverless).
// Skips already-applied files, so it's safe to run on every deploy.
runPendingMigrations().catch((e) => {
  console.error("[db] Migration failed on cold start:", e);
});

const app = createApp({
  apiMountPath: "/",
});

export default app;