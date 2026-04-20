import "./load-env.js";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { getPool } from "./db/pool.js";
import { INSTANCE_ID, STARTED_AT_ISO } from "./instance-id.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createSuperAdminApiRouter } from "./super-admin/index.js";

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
  app.use(express.json({ limit: "1mb" }));

  app.use(apiMountPath, createSuperAdminApiRouter());

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

  return app;
}

