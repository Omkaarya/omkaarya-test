import type { Pool, PoolClient } from "pg";

export type TempleBillingAccessRow = {
  status: string;
  trial_ends_at: Date | null;
  has_active_subscription: boolean;
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

/**
 * Enforces billing access for temples with `trial_ends_at` set (new temples only).
 * Legacy temples without `trial_ends_at` are not blocked by trial rules.
 */
export async function checkTempleBillingAccess(
  db: Pool | PoolClient,
  tenantId: string
): Promise<TempleBillingAccessResult> {
  const id = tenantId.trim();
  if (!id) {
    return { ok: false, code: "SUBSCRIPTION_REQUIRED", message: "Invalid temple session." };
  }

  const res = await db.query<TempleBillingAccessRow>(
    `SELECT
       t.status,
       t.trial_ends_at,
       EXISTS (
         SELECT 1 FROM public.subscriptions s
         WHERE s.tenant_id = t.tenant_id AND s.status = 'Active'
       ) AS has_active_subscription
     FROM public.temples t
     WHERE t.tenant_id = $1
     LIMIT 1`,
    [id]
  );

  const row = res.rows[0];
  if (!row) {
    return { ok: false, code: "SUBSCRIPTION_REQUIRED", message: "Temple not found." };
  }

  if (row.has_active_subscription) {
    return { ok: true };
  }

  if (row.trial_ends_at == null) {
    return { ok: true };
  }

  const trialEnd = row.trial_ends_at.getTime();
  const now = Date.now();

  if (row.status === "Suspended" && trialEnd <= now) {
    return DENIED_TRIAL;
  }

  if (trialEnd <= now) {
    return DENIED_TRIAL;
  }

  return { ok: true };
}
