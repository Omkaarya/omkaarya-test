import "./load-env.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { getPoolConfig } from "./db/config.js";
import { getPool } from "./db/pool.js";
import { runPendingMigrations } from "./db/run-migrations.js";
import { INSTANCE_ID, STARTED_AT_ISO } from "./instance-id.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createSuperAdminApiRouter } from "./super-admin/index.js";

/**
 * Runs pending SQL migrations on startup when:
 * - `AUTO_MIGRATE=1|true|yes`, or
 * - unset and `NODE_ENV` is not `production` (local dev convenience).
 * Set `AUTO_MIGRATE=0` or `false` to skip even in development.
 */
function autoMigrateEnabled(): boolean {
  const v = (process.env.AUTO_MIGRATE ?? "").trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return process.env.NODE_ENV !== "production";
}

/** Single origin or comma-separated list (e.g. production + Vercel preview URLs). */
function corsOriginOption(): string | string[] {
  const raw = (process.env.CORS_ORIGIN ?? "http://localhost:3000").trim();
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "http://localhost:3000";
  if (parts.length === 1) return parts[0];
  return parts;
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

  const app = express();
  const PORT = Number(process.env.PORT) || 4000;

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use((_req, res, next) => {
    res.setHeader("X-Omkaarya-Backend", "omkaarya-test-backend");
    res.setHeader("X-Omkaarya-Instance", INSTANCE_ID);
    next();
  });

  app.use(
    cors({
      origin: corsOriginOption(),
      credentials: true,
    })
  );

  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use(express.json({ limit: "1mb" }));

  app.use("/api", createSuperAdminApiRouter());

  app.get("/health", async (_req, res) => {
    try {
      const pool = getPool();
      if (!pool) {
        return res.json({
          ok: true,
          service: "omkaarya-test-backend",
          instanceId: INSTANCE_ID,
          startedAt: STARTED_AT_ISO,
          database: { connected: false },
        });
      }
      const { rows } = await pool.query<{ name: string; temples_count: number }>(
        `SELECT current_database() AS name,
                (SELECT COUNT(*)::int FROM public.temples) AS temples_count`
      );
      return res.json({
        ok: true,
        service: "omkaarya-test-backend",
        instanceId: INSTANCE_ID,
        startedAt: STARTED_AT_ISO,
        database: {
          connected: true,
          name: rows[0].name,
          templesRowCount: rows[0].temples_count,
          table: "public.temples",
        },
      });
    } catch (e) {
      return res.json({
        ok: true,
        service: "omkaarya-test-backend",
        instanceId: INSTANCE_ID,
        startedAt: STARTED_AT_ISO,
        database: {
          connected: false,
          error: e instanceof Error ? e.message : String(e),
        },
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`omkaarya-test-backend listening on http://localhost:${PORT}`);
    console.log(
      `[instance] ${INSTANCE_ID} — If Postman responses lack headers X-Omkaarya-Backend / X-Omkaarya-Instance, another process is using port ${PORT}.`
    );
  });
}

bootstrap();
