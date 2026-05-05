import "./load-env.js";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { getPool } from "./db/pool.js";
import { INSTANCE_ID, STARTED_AT_ISO } from "./instance-id.js";
import { sendError, sendSuccess } from "./middleware/api-envelope.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createSuperAdminApiRouter } from "./super-admin/index.js";
import { createTempleOpsApiRouter } from "./temple-ops/index.js";

type CreateAppOptions = {
  /** Mount path for the API router (e.g. "/api"). */
  apiMountPath?: string;
};

/** Single origin or comma-separated list (e.g. production + Vercel preview URLs). */
function corsOriginOption(): string | string[] {
  const raw = (process.env.CORS_ORIGIN ?? "http://localhost:3000").trim();
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "http://localhost:3000";
  if (parts.length === 1) return parts[0];
  return parts;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const apiMountPath = options.apiMountPath ?? "/api";

  const app = express();

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
  // Temple create/update sends base64 assets (logo, admin photo); default 1mb is too small.
  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "10mb" }));

  const healthHandler: express.RequestHandler = async (_req, res) => {
    try {
      const pool = getPool();
      if (!pool) {
        return sendSuccess(
          res,
          200,
          {
            service: "omkaarya-test-backend",
            instanceId: INSTANCE_ID,
            startedAt: STARTED_AT_ISO,
            database: { connected: false },
          },
          "Service is running",
          "The API process is up; the database pool is not configured, so `database.connected` is false."
        );
      }
      const { rows } = await pool.query<{ name: string; temples_count: number }>(
        `SELECT current_database() AS name,
                (SELECT COUNT(*)::int FROM public.temples) AS temples_count`
      );
      return sendSuccess(
        res,
        200,
        {
          service: "omkaarya-test-backend",
          instanceId: INSTANCE_ID,
          startedAt: STARTED_AT_ISO,
          database: {
            connected: true,
            name: rows[0].name,
            templesRowCount: rows[0].temples_count,
            table: "public.temples",
          },
        },
        "Service is healthy",
        "The API and PostgreSQL are reachable; row counts and database name are included for diagnostics."
      );
    } catch (e) {
      return sendSuccess(
        res,
        200,
        {
          service: "omkaarya-test-backend",
          instanceId: INSTANCE_ID,
          startedAt: STARTED_AT_ISO,
          database: {
            connected: false,
            error: e instanceof Error ? e.message : String(e),
          },
        },
        "Service is running with database check errors",
        "The process is up but the health query failed; see `database.error` for the reason."
      );
    }
  };

  // Keep `/health` for local + also expose `${apiMountPath}/health` for serverless setups (e.g. Vercel).
  app.get("/health", healthHandler);

  /** Platform + onboarding + billing routes. */
  app.use(apiMountPath, createSuperAdminApiRouter());
  /** JWT-protected temple operational routes (inventory, …); uses per-temple PostgreSQL from `temples.operational_*`. */
  app.use(apiMountPath, createTempleOpsApiRouter());

  app.use((_req, res) => {
    sendError(
      res,
      404,
      "NOT_FOUND",
      "Not found",
      "No route matches this method and path on the API."
    );
  });

  app.use(errorHandler);

  return app;
}

