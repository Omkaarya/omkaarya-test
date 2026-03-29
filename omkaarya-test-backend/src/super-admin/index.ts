import { Router } from "express";
import { PostgresAuthRepository } from "./auth.repository.js";
import { createAuthRouter } from "./auth.routes.js";
import { AuthService } from "./auth.service.js";
import { PostgresTempleRepository } from "./temples.repository.js";
import { createTemplesRouter } from "./temples.routes.js";
import { TemplesService } from "./temples.service.js";

/**
 * Super-admin HTTP API mounted at `/api`:
 * - GET  /api/temples
 * - POST /api/temples/create
 * - POST /api/login
 *
 * Requires PostgreSQL (see server bootstrap).
 */
export function createSuperAdminApiRouter(): Router {
  const templeRepo = new PostgresTempleRepository();
  const templesService = new TemplesService(templeRepo);

  const authService = new AuthService(new PostgresAuthRepository());

  const api = Router();
  api.use(createTemplesRouter(templesService));
  api.use(createAuthRouter(authService));
  api.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  return api;
}

export type { CreateTemplePayload, TempleRecord, TemplesListResponse } from "./types.js";
