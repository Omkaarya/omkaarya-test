import "./load-env.js";
import { getPoolConfig } from "./db/config.js";
import { getPool } from "./db/pool.js";
import { runPendingMigrations } from "./db/run-migrations.js";
import { createApp } from "./app.js";
import { INSTANCE_ID } from "./instance-id.js";

/**
 * Runs pending SQL migrations on startup when:
 * - `AUTO_MIGRATE=1|true|yes`, or
 * - unset and `NODE_ENV` is not `production` (local dev convenience).
 * Set `AUTO_MIGRATE=0` or `false` to skip even in development.
 *
 * Migrations are schema-only. Demo/reference rows (temples, users, RBAC, etc.)
 * are inserted only via `npm run seed`, never on server start.
 */
function autoMigrateEnabled(): boolean {
  const v = (process.env.AUTO_MIGRATE ?? "").trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return process.env.NODE_ENV !== "production";
}

async function bootstrap(): Promise<void> {
  if (autoMigrateEnabled()) {
    try {
      const { applied, skipped } = await runPendingMigrations();
      console.log(
        `[db] AUTO_MIGRATE: applied ${applied.length} file(s), skipped ${skipped.length} already applied`
      );
    } catch (e) {
      console.error("[db] AUTO_MIGRATE failed (fix DB config or run `npm run migrate` manually):", e);
      process.exit(1);
    }
  }

  if (!getPoolConfig()) {
    console.error(
      "[db] PostgreSQL is required. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME (and DB_PASS, DB_PORT) in .env"
    );
    process.exit(1);
  }

  try {
    const pool = getPool();
    if (pool) {
      const { rows } = await pool.query<{ name: string; temples_count: number }>(
        `SELECT current_database() AS name,
                (SELECT COUNT(*)::int FROM public.temples) AS temples_count`
      );
      console.log(
        `[db] Connected to database "${rows[0].name}" — public.temples has ${rows[0].temples_count} row(s). GET /health shows the same.`
      );
    }
  } catch (e) {
    console.warn("[db] Could not verify public.temples count:", e);
  }

  const PORT = Number(process.env.PORT) || 4000;
  const app = createApp({ apiMountPath: "/api" });

  app.listen(PORT, () => {
    console.log(`omkaarya-test-backend listening on http://localhost:${PORT}`);
    console.log(
      `[instance] ${INSTANCE_ID} — If Postman responses lack headers X-Omkaarya-Backend / X-Omkaarya-Instance, another process is using port ${PORT}.`
    );
  });
}

bootstrap();
