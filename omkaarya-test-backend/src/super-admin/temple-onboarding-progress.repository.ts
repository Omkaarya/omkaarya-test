import { getPool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type TempleOnboardingProgress = {
  needsPasswordChange: boolean;
  hasPlanSelected: boolean;
  hasPaymentCompleted: boolean;
  hasTempleProfileDetailsSaved: boolean;
  hasDeitySelectionComplete: boolean;
  hasOnboardingCompleted: boolean;
  templeId: string;
  isInTrial: boolean;
  hasPayableInvoice: boolean;
  trialEndsAt: string | null;
  trialProformaInvoiceNumber: string | null;
};

export class PostgresTempleOnboardingProgressRepository {
  async getProgressBySessionEmail(sessionEmail: string): Promise<TempleOnboardingProgress | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const email = sessionEmail.trim();
    if (!email) return null;

    const userRes = await pool.query<{ id: string; password_hash: string | null }>(
      `SELECT id, password_hash
         FROM public.users
        WHERE lower(trim(email)) = lower(trim($1))
        LIMIT 1`,
      [email]
    );
    const user = userRes.rows[0];
    if (!user) return null;

    const templeRes = await pool.query<{
      tenant_id: string;
      pricing_plan_id: string | null;
      plan: string | null;
      plan_confirmed_at: Date | null;
      status: string;
      trial_ends_at: Date | null;
    }>(
      `SELECT tenant_id, pricing_plan_id, plan, plan_confirmed_at, status, trial_ends_at
         FROM public.temples
        WHERE ${sqlTempleMatchesSessionEmail(1)}
        LIMIT 1`,
      [email]
    );
    const temple = templeRes.rows[0];
    if (!temple) return null;

    const tenantId = temple.tenant_id;
    const hasPlanSelected = Boolean(
      temple.pricing_plan_id?.trim() || (temple.plan?.trim() && temple.plan_confirmed_at)
    );

    const now = Date.now();
    const trialEndsAt =
      temple.trial_ends_at != null ? temple.trial_ends_at.toISOString() : null;
    const isInTrial =
      temple.status === "Trial" &&
      temple.trial_ends_at != null &&
      temple.trial_ends_at.getTime() > now;

    const payableRes = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n
         FROM public.billing_invoices
        WHERE tenant_id = $1
          AND status = 'pending'
          AND (NOT is_trial_proforma)
          AND amount_cents > 0`,
      [tenantId]
    );
    const hasPayableInvoice = (payableRes.rows[0]?.n ?? 0) > 0;

    const proformaRes = await pool.query<{ invoice_number: string }>(
      `SELECT invoice_number
         FROM public.billing_invoices
        WHERE tenant_id = $1
          AND is_trial_proforma = true
        ORDER BY issued_at DESC
        LIMIT 1`,
      [tenantId]
    );
    const trialProformaInvoiceNumber = proformaRes.rows[0]?.invoice_number?.trim() || null;

    let hasPaymentCompleted = false;
    let hasTempleProfileDetailsSaved = false;
    let hasDeitySelectionComplete = false;
    let hasOnboardingCompleted = false;

    const opsPool = await getOperationalPoolForTenant(tenantId);
    if (opsPool) {
      const opsRes = await opsPool.query<{
        payment_onboarding_completed_at: Date | null;
        onboarding_completed_at: Date | null;
        primary_deity_id: string | null;
        deity_prefer_custom_later: boolean | null;
        full_address: unknown;
        website_url: string | null;
        logo_data_url: string | null;
      }>(
        `SELECT payment_onboarding_completed_at, onboarding_completed_at,
                primary_deity_id, deity_prefer_custom_later,
                full_address, website_url, logo_data_url
           FROM temple_admin_data
          WHERE id = 1
          LIMIT 1`
      );
      const ops = opsRes.rows[0];
      if (ops) {
        hasPaymentCompleted = ops.payment_onboarding_completed_at != null;
        hasOnboardingCompleted = ops.onboarding_completed_at != null;
        hasDeitySelectionComplete = Boolean(
          ops.primary_deity_id?.trim() || ops.deity_prefer_custom_later === true
        );
        const addr = ops.full_address as { street?: string } | null;
        const street = typeof addr?.street === "string" ? addr.street.trim() : "";
        hasTempleProfileDetailsSaved = Boolean(
          street || ops.website_url?.trim() || ops.logo_data_url?.trim()
        );
      }
    }

    return {
      needsPasswordChange: !user.password_hash,
      hasPlanSelected,
      hasPaymentCompleted,
      hasTempleProfileDetailsSaved,
      hasDeitySelectionComplete,
      hasOnboardingCompleted,
      templeId: tenantId,
      isInTrial,
      hasPayableInvoice,
      trialEndsAt,
      trialProformaInvoiceNumber,
    };
  }
}
