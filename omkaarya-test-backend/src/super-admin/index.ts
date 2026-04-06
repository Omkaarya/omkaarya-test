import { Router } from "express";
import { PostgresAuthRepository } from "./auth.repository.js";
import { createAuthRouter } from "./auth.routes.js";
import { AuthService } from "./auth.service.js";
import { PostgresTempleAdminProfileRepository } from "./temple-admin-profile.repository.js";
import { createTempleAdminProfileRouter } from "./temple-admin.routes.js";
import { PostgresTempleDeityRepository } from "./temple-deity.repository.js";
import { createTempleDeityRouter } from "./temple-deity.routes.js";
import { PostgresTempleOnboardingCompleteRepository } from "./temple-onboarding-complete.repository.js";
import { createTempleOnboardingCompleteRouter } from "./temple-onboarding-complete.routes.js";
import { PostgresTemplePaymentOnboardingRepository } from "./temple-payment-onboarding.repository.js";
import { createTemplePaymentOnboardingRouter } from "./temple-payment-onboarding.routes.js";
import { PostgresTemplePlanRepository } from "./temple-plan.repository.js";
import { createTemplePlanRouter } from "./temple-plan.routes.js";
import { PostgresTempleRepository } from "./temples.repository.js";
import { createTemplesRouter } from "./temples.routes.js";
import { TemplesService } from "./temples.service.js";

/**
 * Super-admin HTTP API mounted at `/api`:
 * - GET  /api/temples
 * - POST /api/temples/create
 * - POST /api/login
 * - POST /api/set-password
 * - POST /api/temple-admin/profile
 * - POST /api/temple-admin/deity-selection
 * - POST /api/temple-admin/plan-selection
 * - POST /api/temple-admin/payment-onboarding
 * - POST /api/temple-admin/onboarding-complete
 *
 * Requires PostgreSQL (see server bootstrap).
 */
export function createSuperAdminApiRouter(): Router {
  const templeRepo = new PostgresTempleRepository();
  const templesService = new TemplesService(templeRepo);

  const authService = new AuthService(new PostgresAuthRepository());
  const templeAdminProfiles = new PostgresTempleAdminProfileRepository();
  const templeDeities = new PostgresTempleDeityRepository();
  const templePlans = new PostgresTemplePlanRepository();
  const templePaymentOnboarding = new PostgresTemplePaymentOnboardingRepository();
  const templeOnboardingComplete = new PostgresTempleOnboardingCompleteRepository();

  const api = Router();
  api.use(createTemplesRouter(templesService));
  api.use(createAuthRouter(authService));
  api.use(createTempleAdminProfileRouter(templeAdminProfiles));
  api.use(createTempleDeityRouter(templeDeities));
  api.use(createTemplePlanRouter(templePlans));
  api.use(createTemplePaymentOnboardingRouter(templePaymentOnboarding));
  api.use(createTempleOnboardingCompleteRouter(templeOnboardingComplete));
  api.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  return api;
}

export type { CreateTemplePayload, TempleRecord, TemplesListResponse } from "./types.js";
