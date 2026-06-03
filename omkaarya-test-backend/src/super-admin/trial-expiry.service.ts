import type { PoolClient } from "pg";
import { getPool, requirePool } from "../db/pool.js";
import { sendInvoiceOnlyEmail } from "../email/send-temple-billing.js";
import {
  createPostTrialPendingInvoice,
  type CreateInitialInvoiceResult,
} from "./billing.repository.js";

export type ExpireTrialsResult = {
  processed: number;
  tenantIds: string[];
  errors: Array<{ tenantId: string; error: string }>;
};

async function hasPayablePendingInvoice(client: PoolClient, tenantId: string): Promise<boolean> {
  const r = await client.query<{ n: number }>(
    `SELECT COUNT(*)::int AS n
     FROM public.billing_invoices
     WHERE tenant_id = $1
       AND status = 'pending'
       AND (NOT is_trial_proforma)
       AND amount_cents > 0`,
    [tenantId]
  );
  return (r.rows[0]?.n ?? 0) > 0;
}

async function expireOneTemple(
  client: PoolClient,
  row: {
    tenant_id: string;
    name: string;
    plan: string;
    billing_cycle: string | null;
    admin_email: string;
  }
): Promise<CreateInitialInvoiceResult | null> {
  const tenantId = row.tenant_id;

  if (await hasPayablePendingInvoice(client, tenantId)) {
    await client.query(
      `UPDATE public.temples SET status = 'Suspended' WHERE tenant_id = $1 AND status = 'Trial'`,
      [tenantId]
    );
    return null;
  }

  const invoice = await createPostTrialPendingInvoice(client, {
    tenantId,
    planName: row.plan.trim() || "Sankalpa",
    templeName: row.name.trim() || "Temple",
    billingCycleRaw: row.billing_cycle ?? "Annually",
  });

  await client.query(
    `UPDATE public.temples SET status = 'Suspended' WHERE tenant_id = $1`,
    [tenantId]
  );

  return invoice;
}

/**
 * Expires trials whose `trial_ends_at` has passed. Idempotent per tenant.
 */
export async function expireTrials(): Promise<ExpireTrialsResult> {
  const pool = requirePool();
  const client = await pool.connect();
  const tenantIds: string[] = [];
  const errors: ExpireTrialsResult["errors"] = [];

  try {
    const due = await client.query<{
      tenant_id: string;
      name: string;
      plan: string;
      billing_cycle: string | null;
      admin_email: string;
    }>(
      `SELECT tenant_id, name, plan, billing_cycle, admin_email
       FROM public.temples
       WHERE status = 'Trial'
         AND trial_ends_at IS NOT NULL
         AND trial_ends_at <= NOW()
       ORDER BY trial_ends_at ASC`
    );

    for (const row of due.rows) {
      try {
        await client.query("BEGIN");
        const invoice = await expireOneTemple(client, row);
        await client.query("COMMIT");
        tenantIds.push(row.tenant_id);

        if (invoice && row.admin_email.trim()) {
          try {
            await sendInvoiceOnlyEmail({
              to: row.admin_email.trim(),
              templeName: row.name,
              invoiceNumber: invoice.invoiceNumber,
              amountCents: invoice.amountCents,
              isTrialProforma: false,
              planName: invoice.planName,
              dueDate: invoice.dueDate,
            });
          } catch (e) {
            console.error(`[expireTrials] email failed for ${row.tenant_id}`, e);
          }
        }
      } catch (e) {
        await client.query("ROLLBACK");
        errors.push({
          tenantId: row.tenant_id,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { processed: tenantIds.length, tenantIds, errors };
  } finally {
    client.release();
  }
}

/** Extend trial end date for a temple (super admin). */
export async function extendTempleTrial(
  tenantId: string,
  extraDays: number
): Promise<
  | { ok: true; trialEndsAt: string; status: string }
  | { ok: false; reason: "not_found" | "invalid_days" | "no_trial" }
> {
  const pool = getPool();
  if (!pool) throw new Error("Database pool is not available");

  const days = Math.trunc(extraDays);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { ok: false, reason: "invalid_days" };
  }

  const id = tenantId.trim();
  const res = await pool.query<{
    status: string;
    trial_ends_at: Date | null;
  }>(`SELECT status, trial_ends_at FROM public.temples WHERE tenant_id = $1 LIMIT 1`, [id]);

  const row = res.rows[0];
  if (!row) return { ok: false, reason: "not_found" };
  if (row.trial_ends_at == null) return { ok: false, reason: "no_trial" };

  const base = row.trial_ends_at.getTime() > Date.now() ? row.trial_ends_at : new Date();
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const upd = await pool.query<{ trial_ends_at: string; status: string }>(
    `UPDATE public.temples
     SET trial_ends_at = $2,
         status = CASE WHEN status = 'Suspended' THEN 'Trial' ELSE status END
     WHERE tenant_id = $1
     RETURNING trial_ends_at::text AS trial_ends_at, status`,
    [id, next.toISOString()]
  );

  const out = upd.rows[0];
  if (!out) return { ok: false, reason: "not_found" };

  return { ok: true, trialEndsAt: out.trial_ends_at, status: out.status };
}
