import type { Pool, PoolClient } from "pg";

export type TempleBillingAccessRow = {
  status: string;
  trial_ends_at: Date | null;
  has_active_subscription: boolean;
  has_payable_invoice: boolean;
};

export type TempleBillingAccessDenied = {
  ok: false;
  code: "TRIAL_EXPIRED" | "SUBSCRIPTION_REQUIRED";
  message: string;
};

export type TempleBillingAccessOk = { ok: true };

export type TempleBillingAccessResult = TempleBillingAccessOk | TempleBillingAccessDenied;

const DENIED_TRIAL: TempleBillingAccessDenied = {
  ok: false,
  code: "TRIAL_EXPIRED",
  message:
    "Your 14-day trial has ended. A subscription invoice was sent to your email. Please complete payment and contact Omkaarya support to restore access.",
};

async function loadBillingAccessRow(
  db: Pool | PoolClient,
  tenantId: string
): Promise<TempleBillingAccessRow | null> {
  const res = await db.query<TempleBillingAccessRow>(
    `SELECT
       t.status,
       t.trial_ends_at,
       EXISTS (
         SELECT 1 FROM public.subscriptions s
         WHERE s.tenant_id = t.tenant_id AND s.status = 'Active'
       ) AS has_active_subscription,
       EXISTS (
         SELECT 1 FROM public.billing_invoices b
         WHERE b.tenant_id = t.tenant_id
           AND b.status = 'pending'
           AND (NOT b.is_trial_proforma)
           AND b.amount_cents > 0
       ) AS has_payable_invoice
     FROM public.temples t
     WHERE t.tenant_id = $1
     LIMIT 1`,
    [tenantId]
  );
  return res.rows[0] ?? null;
}

function evaluateBillingAccess(
  row: TempleBillingAccessRow,
  options?: { allowPaymentAndOnboarding?: boolean }
): TempleBillingAccessResult {
  if (row.has_active_subscription) {
    return { ok: true };
  }

  if (row.trial_ends_at == null) {
    return { ok: true };
  }

  const trialEnd = row.trial_ends_at.getTime();
  const now = Date.now();
  const trialExpired = trialEnd <= now;

  if (!trialExpired) {
    return { ok: true };
  }

  if (options?.allowPaymentAndOnboarding && row.has_payable_invoice) {
    return { ok: true };
  }

  if (row.status === "Suspended" || trialExpired) {
    return DENIED_TRIAL;
  }

  return { ok: true };
}

/**
 * Enforces billing access for temples with `trial_ends_at` set (new temples only).
 * Legacy temples without `trial_ends_at` are not blocked by trial rules.
 */
export async function checkTempleBillingAccess(
  db: Pool | PoolClient,
  tenantId: string,
  options?: { allowPaymentAndOnboarding?: boolean }
): Promise<TempleBillingAccessResult> {
  const id = tenantId.trim();
  if (!id) {
    return { ok: false, code: "SUBSCRIPTION_REQUIRED", message: "Invalid temple session." };
  }

  const row = await loadBillingAccessRow(db, id);
  if (!row) {
    return { ok: false, code: "SUBSCRIPTION_REQUIRED", message: "Temple not found." };
  }

  return evaluateBillingAccess(row, options);
}

/** Allows temple admins to sign in when trial expired but they must pay or finish onboarding. */
export async function checkTempleBillingAccessForLogin(
  db: Pool | PoolClient,
  tenantId: string
): Promise<TempleBillingAccessResult> {
  return checkTempleBillingAccess(db, tenantId, { allowPaymentAndOnboarding: true });
}
