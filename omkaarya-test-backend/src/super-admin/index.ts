import { Router } from "express";
import { PostgresAuthRepository } from "./auth.repository.js";
import { createAuthRouter } from "./auth.routes.js";
import { AuthService } from "./auth.service.js";
import { createPasswordResetRouter } from "./password-reset.routes.js";
import { PasswordResetService } from "./password-reset.service.js";
import { PostgresTempleAdminProfileRepository } from "./temple-admin-profile.repository.js";
import { createTempleAdminProfileRouter } from "./temple-admin.routes.js";
import { PostgresTempleDeityRepository } from "./temple-deity.repository.js";
import { createTempleDeityRouter } from "./temple-deity.routes.js";
import { PostgresTempleOnboardingCompleteRepository } from "./temple-onboarding-complete.repository.js";
import { createTempleOnboardingCompleteRouter } from "./temple-onboarding-complete.routes.js";
import { PostgresTemplePaymentOnboardingRepository } from "./temple-payment-onboarding.repository.js";
import { createTemplePaymentOnboardingRouter } from "./temple-payment-onboarding.routes.js";
import { PostgresTemplePaymentSubmissionsRepository } from "./temple-payment-submissions.repository.js";
import { createTemplePaymentSubmissionsRouter } from "./temple-payment-submissions.routes.js";
import { PostgresTemplePlanRepository } from "./temple-plan.repository.js";
import { createTemplePlanRouter } from "./temple-plan.routes.js";
import { PostgresTempleRepository } from "./temples.repository.js";
import { createTempleSessionProfileRouter } from "./temple-session-profile.routes.js";
import { createTemplesRouter } from "./temples.routes.js";
import { TemplesService } from "./temples.service.js";
import { PostgresSubscriptionsRepository } from "./subscriptions.repository.js";
import { createSubscriptionsRouter } from "./subscriptions.routes.js";
import { PostgresPricingPlansRepository } from "./pricing-plans.repository.js";
import { createPricingPlansRouter } from "./pricing-plans.routes.js";
import { createBillingRouter } from "./billing.routes.js";
import { PostgresBillingRepository } from "./billing.repository.js";
import { createTempleBillingRouter } from "./temple-billing.routes.js";
import { createDashboardRouter } from "./dashboard.routes.js";
import { createPublicRouter } from "../public/public.routes.js";
import { requireSuperAdminJwt } from "./middleware/require-super-admin-jwt.js";

/**
 * Super-admin HTTP API mounted at `/api`:
 * - GET  /api/billing/invoices, /api/billing/transactions, /api/billing/receipts, /api/billing/payment-submissions/pending
 * - GET  /api/billing/receipts/:id
 * - POST /api/billing/payment-submissions/:id/confirm, /api/billing/payment-submissions/:id/reject
 * - GET  /api/temple-admin/billing/invoices?sessionEmail=&templeId=
 * - GET  /api/temples
 * - GET  /api/pricing-plans/comparison
 * - GET  /api/public/why-it-matters-dashboard
 * - GET  /api/temples/:tenantId
 * - PATCH /api/temples/:tenantId
 * - POST /api/temples/create (provisions operational DB when TEMPLE_OPS_* is configured)
 * - POST /api/login
 * - POST /api/set-password
 * - POST /api/password-reset/request
 * - POST /api/password-reset/resend
 * - POST /api/password-reset/verify-otp
 * - POST /api/password-reset/complete
 * - POST /api/temple-admin/profile
 * - POST /api/temple-admin/deity-selection
 * - POST /api/temple-admin/plan-selection
 * - POST /api/temple-admin/payment-onboarding
 * - POST /api/temple-admin/onboarding-complete
 * - GET  /api/temple-admin/temple-profile?sessionEmail=
 * - PATCH /api/temple-admin/temple-profile/details
 *
 * Requires PostgreSQL (see server bootstrap).
 */
export function createSuperAdminApiRouter(): Router {
  const templeRepo = new PostgresTempleRepository();
  const templesService = new TemplesService(templeRepo);

  const authService = new AuthService(new PostgresAuthRepository());
  const passwordResetService = new PasswordResetService();
  const templeAdminProfiles = new PostgresTempleAdminProfileRepository();
  const templeDeities = new PostgresTempleDeityRepository();
  const templePlans = new PostgresTemplePlanRepository();
  const templePaymentOnboarding = new PostgresTemplePaymentOnboardingRepository();
  const templePaymentSubmissions = new PostgresTemplePaymentSubmissionsRepository();
  const templeOnboardingComplete = new PostgresTempleOnboardingCompleteRepository();
  const subscriptions = new PostgresSubscriptionsRepository();
  const pricingPlans = new PostgresPricingPlansRepository();
  const billing = new PostgresBillingRepository();

  const api = Router();
  api.use(createAuthRouter(authService));
  api.use(createPasswordResetRouter(passwordResetService));
  api.use(createPublicRouter(pricingPlans));

  api.use(["/temples", "/billing", "/super-admin", "/subscriptions", "/pricing-plans"], requireSuperAdminJwt);
  api.use(createTemplesRouter(templesService));
  api.use(createBillingRouter(billing));
  api.use(createDashboardRouter(billing));
  api.use(createSubscriptionsRouter(subscriptions));
  api.use(createPricingPlansRouter(pricingPlans));

  api.use(createTempleBillingRouter());
  api.use(createTempleSessionProfileRouter(templeRepo));
  api.use(createTempleAdminProfileRouter(templeAdminProfiles));
  api.use(createTempleDeityRouter(templeDeities));
  api.use(createTemplePlanRouter(templePlans));
  api.use(createTemplePaymentOnboardingRouter(templePaymentOnboarding));
  api.use(createTemplePaymentSubmissionsRouter(templePaymentSubmissions));
  api.use(createTempleOnboardingCompleteRouter(templeOnboardingComplete));
  return api;
}

export type {
  CreateTemplePayload,
  SuperAdminTempleDetailResponse,
  TempleRecord,
  TemplesListResponse,
  UpdateTemplePayload,
} from "./types.js";
