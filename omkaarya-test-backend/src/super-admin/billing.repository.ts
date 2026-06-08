import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { computeDefaultDueDate, displayNameFromEmail } from "../billing/invoice-defaults.js";
import { requirePool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { fetchTempleStreetAddressesByTenantIds } from "../temple-ops/temple-admin-data.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type InvoiceStatus = "proforma" | "pending" | "paid" | "void" | "rejected";
export type BillingCycleStore = "Monthly" | "Annual";

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export type RevenueDashboardPeriod = "this-month" | "last-month" | "this-year" | `${number}-${string}`;

/** Map wizard "Annually" / plan-selection lowercase to DB and subscriptions UI. */
export function toBillingCycleStore(raw: string | null | undefined): BillingCycleStore {
  const lower = (raw ?? "").trim().toLowerCase();
  if (lower === "annually" || lower === "annual" || lower === "yearly") return "Annual";
  if (lower === "monthly") return "Monthly";
  const s = (raw ?? "").trim();
  if (s === "Annually" || s === "Annual" || s === "Yearly") return "Annual";
  return "Monthly";
}

function addMonths(d: Date, m: number): Date {
  const o = new Date(d);
  o.setMonth(o.getMonth() + m);
  return o;
}
function addYears(d: Date, y: number): Date {
  const o = new Date(d);
  o.setFullYear(o.getFullYear() + y);
  return o;
}

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}
function addUtcMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1, 0, 0, 0, 0));
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function utcMonthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** UI label for invoice billing_cycle (e.g. Annual → Yearly). */
export function formatBillingCycleChartLabel(cycle: string | null | undefined): string {
  const s = (cycle ?? "").trim();
  if (s === "Annual" || s === "Annually" || s === "Yearly") return "Yearly";
  if (s === "Monthly") return "Monthly";
  return s || "—";
}

function monthKeyToChartLabel(monthKey: string, isCurrent: boolean): string {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!m) return monthKey;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const name = new Date(Date.UTC(y, mo - 1, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  return isCurrent ? `${name} (Current)` : name;
}

function periodRange(input: { period: RevenueDashboardPeriod }): { start: Date; endExclusive: Date; label: { startDate: string; endDateExclusive: string } } {
  const now = new Date();
  const thisMonthStart = startOfUtcMonth(now);
  let start: Date;
  let endExclusive: Date;
  if (input.period === "this-month") {
    start = thisMonthStart;
    endExclusive = addUtcMonths(thisMonthStart, 1);
  } else if (input.period === "last-month") {
    start = addUtcMonths(thisMonthStart, -1);
    endExclusive = thisMonthStart;
  } else if (input.period === "this-year") {
    start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
    endExclusive = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1, 0, 0, 0, 0));
  } else {
    const m = /^(\d{4})-(\d{2})$/.exec(String(input.period).trim());
    if (m) {
      const y = Number(m[1]);
      const mm = Number(m[2]);
      start = new Date(Date.UTC(y, Math.max(0, mm - 1), 1, 0, 0, 0, 0));
      endExclusive = addUtcMonths(start, 1);
    } else {
      start = thisMonthStart;
      endExclusive = addUtcMonths(thisMonthStart, 1);
    }
  }
  return { start, endExclusive, label: { startDate: isoDate(start), endDateExclusive: isoDate(endExclusive) } };
}

export async function nextInvoiceNumber(client: Pick<PoolClient, "query">): Promise<string> {
  const y = new Date().getUTCFullYear();
  const { rows } = await client.query<{ seq: string }>(`SELECT nextval('public.billing_invoice_number_seq')::text AS seq`);
  const n = String(rows[0]?.seq ?? "1");
  return `INV-${y}-${n.padStart(5, "0")}`;
}

/** Preview the next invoice number without consuming the sequence. */
export async function peekNextInvoiceNumber(client: Pick<PoolClient, "query">): Promise<string> {
  const y = new Date().getUTCFullYear();
  const { rows } = await client.query<{ next_n: string }>(
    `SELECT CASE WHEN is_called THEN last_value + 1 ELSE last_value END::text AS next_n
     FROM public.billing_invoice_number_seq`
  );
  const n = String(rows[0]?.next_n ?? "1");
  return `INV-${y}-${n.padStart(5, "0")}`;
}

export async function nextReceiptNumber(client: Pick<PoolClient, "query">): Promise<string> {
  const y = new Date().getUTCFullYear();
  const { rows } = await client.query<{ seq: string }>(`SELECT nextval('public.billing_receipt_number_seq')::text AS seq`);
  const n = String(rows[0]?.seq ?? "1");
  return `RCPT-${y}-${n.padStart(5, "0")}`;
}

export type CreateInitialInvoiceInput = {
  tenantId: string;
  planName: string;
  /** Prefer lookup by catalog UUID when the plan name is custom. */
  pricingPlanId?: string | null;
  templeName: string;
  /** Raw from wizard: "Monthly" | "Annually" */
  billingCycleRaw: string;
  trial: boolean;
};

async function loadPricingPlanForBilling(
  client: Pick<PoolClient, "query">,
  input: { planName: string; pricingPlanId?: string | null }
): Promise<{ name: string; price_monthly: number; price_yearly: number }> {
  const catalogId = (input.pricingPlanId ?? "").trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(catalogId)) {
    const byId = await client.query<{
      name: string;
      price_monthly: number;
      price_yearly: number;
    }>(
      `SELECT name, price_monthly, price_yearly
       FROM public.pricing_plans
       WHERE id = $1::uuid
       LIMIT 1`,
      [catalogId]
    );
    if (byId.rows[0]) return byId.rows[0]!;
  }

  const planName = input.planName.trim() || "Sankalpa";
  const byName = await client.query<{
    name: string;
    price_monthly: number;
    price_yearly: number;
  }>(`SELECT name, price_monthly, price_yearly FROM public.pricing_plans WHERE name = $1 LIMIT 1`, [planName]);
  if (byName.rows.length === 0) {
    throw new Error(`Pricing plan not found for name: ${planName}`);
  }
  return byName.rows[0]!;
}

export type CreateInitialInvoiceResult = {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  currency: string;
  isTrialProforma: boolean;
  status: InvoiceStatus;
  subscriptionId: string | null;
  dueDate: string | null;
  planName: string;
};

/**
 * Call inside the same transaction as `INSERT INTO temples` (pass `client`).
 */
export async function createInitialInvoiceForNewTemple(
  client: PoolClient,
  input: CreateInitialInvoiceInput
): Promise<CreateInitialInvoiceResult> {
  const pricing = await loadPricingPlanForBilling(client, {
    planName: input.planName,
    pricingPlanId: input.pricingPlanId,
  });
  const planName = pricing.name.trim() || input.planName.trim() || "Sankalpa";
  const bcStore = toBillingCycleStore(input.billingCycleRaw);

  const { price_monthly, price_yearly } = pricing;

  const invoiceId = randomUUID();
  const invoiceNumber = await nextInvoiceNumber(client);

  if (input.trial) {
    await client.query(
      `INSERT INTO public.billing_invoices (
         id, tenant_id, invoice_number, plan, billing_cycle, amount_cents, currency, status, is_trial_proforma, issued_at, due_at, metadata
       ) VALUES ($1, $2, $3, $4, $5, 0, 'USD', 'proforma', true, (CURRENT_DATE), NULL, $6::jsonb)`,
      [
        invoiceId,
        input.tenantId,
        invoiceNumber,
        planName,
        bcStore,
        JSON.stringify({ label: "Trial pro-forma", templeName: input.templeName }),
      ]
    );
    return {
      invoiceId,
      invoiceNumber,
      amountCents: 0,
      currency: "USD",
      isTrialProforma: true,
      status: "proforma",
      subscriptionId: null,
      dueDate: null,
      planName,
    };
  }

  return createPostTrialPendingInvoice(client, {
    tenantId: input.tenantId,
    planName,
    templeName: input.templeName,
    billingCycleRaw: input.billingCycleRaw,
  });
}

export type CreatePostTrialInvoiceInput = {
  tenantId: string;
  planName: string;
  pricingPlanId?: string | null;
  templeName: string;
  billingCycleRaw: string;
};

/** Pending invoice + Pending subscription (full plan price). Used after trial expiry and non-trial create. */
export async function createPostTrialPendingInvoice(
  client: PoolClient,
  input: CreatePostTrialInvoiceInput
): Promise<CreateInitialInvoiceResult> {
  const pricing = await loadPricingPlanForBilling(client, {
    planName: input.planName,
    pricingPlanId: input.pricingPlanId,
  });
  const planName = pricing.name.trim() || input.planName.trim() || "Sankalpa";
  const bcStore = toBillingCycleStore(input.billingCycleRaw);

  const { price_monthly, price_yearly } = pricing;

  const invoiceId = randomUUID();
  const invoiceNumber = await nextInvoiceNumber(client);
  const amountCents = bcStore === "Annual" ? price_yearly : price_monthly;
  const issued = new Date();
  const issuedIso = issued.toISOString().slice(0, 10);
  const dueIso = computeDefaultDueDate(issuedIso, amountCents);

  await client.query(
    `INSERT INTO public.billing_invoices (
       id, tenant_id, invoice_number, plan, billing_cycle, amount_cents, currency, status, is_trial_proforma, issued_at, due_at, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6, 'USD', 'pending', false, (CURRENT_DATE), $7, $8::jsonb)`,
    [
      invoiceId,
      input.tenantId,
      invoiceNumber,
      planName,
      bcStore,
      amountCents,
      dueIso,
      JSON.stringify({ templeName: input.templeName, source: "post_trial" }),
    ]
  );

  const amountDollars = Math.round(amountCents / 100);
  const paymentDate = issued.toISOString().slice(0, 10);
  const expiresOn = (bcStore === "Annual" ? addYears(issued, 1) : addMonths(issued, 1)).toISOString().slice(0, 10);

  const subRes = await client.query<{ id: string }>(
    `INSERT INTO public.subscriptions (
       tenant_id, plan, billing_cycle, amount, payment_date, receipt_id, status, verified_by, activated_on, expires_on, invoice_id
     ) VALUES ($1, $2, $3, $4, $5::date, NULL, 'Pending', NULL, NULL, $6::date, $7)
     RETURNING id::text AS id`,
    [input.tenantId, planName, bcStore, amountDollars, paymentDate, expiresOn, invoiceId]
  );
  const subscriptionId = subRes.rows[0]?.id ?? null;

  return {
    invoiceId,
    invoiceNumber,
    amountCents,
    currency: "USD",
    isTrialProforma: false,
    status: "pending",
    subscriptionId,
    dueDate: dueIso,
    planName,
  };
}

// --- list queries (pool) ---

export type ListInvoicesInput = {
  q: string;
  status: "all" | InvoiceStatus | "awaiting" | "overdue" | "draft";
  page: number;
  pageSize: number;
};

export type InvoiceListRow = {
  id: string;
  num: string;
  temple: string;
  templeLocation: string;
  templeAddress: string;
  adminEmail: string;
  plan: string;
  period: string;
  amountCents: number;
  issuedDate: string;
  dueDate: string | null;
  status: string;
  currency: string;
  isTrialProforma: boolean;
};

function invoiceUiStatus(
  r: { status: string; is_trial_proforma: boolean; due_at: string | null; amount_cents: number }
): "paid" | "pending" | "overdue" | "draft" {
  if (r.status === "paid") return "paid";
  if (r.status === "proforma") return "draft";
  if (r.status === "void" || r.status === "rejected") return "draft";
  if (r.status === "pending") {
    if (r.due_at) {
      const d = new Date(r.due_at);
      if (d < new Date(new Date().toDateString()) && r.amount_cents > 0) return "overdue";
    }
    return "pending";
  }
  return "pending";
}

export class PostgresBillingRepository {
  async getReceiptForInvoice(invoiceId: string): Promise<{ receiptId: string; receiptNumber: string } | null> {
    const pool = requirePool();
    const { rows } = await pool.query<{ id: string; receipt_number: string }>(
      `SELECT r.id::text AS id, r.receipt_number
       FROM public.billing_receipts r
       WHERE r.invoice_id = $1::uuid
       ORDER BY r.issued_at DESC
       LIMIT 1`,
      [invoiceId.trim()]
    );
    const r = rows[0];
    if (!r) return null;
    return { receiptId: r.id, receiptNumber: r.receipt_number };
  }

  async transactionsKpis(input: { period: RevenueDashboardPeriod }): Promise<{
    period: { startDate: string; endDateExclusive: string };
    paidAmountCents: number;
    paidCount: number;
    pendingAmountCents: number;
    pendingCount: number;
    overdueAmountCents: number;
    overdueCount: number;
    avgCollectionDays: number | null;
  }> {
    const pool = requirePool();
    const pr = periodRange({ period: input.period });

    const paidAgg = await pool.query<{ amount_cents: number; cnt: number }>(
      `SELECT COALESCE(SUM(tx.amount_cents), 0)::int AS amount_cents,
              COUNT(*)::int AS cnt
       FROM public.billing_transactions tx
       WHERE tx.status = 'paid'
         AND tx.recorded_at >= $1::timestamptz
         AND tx.recorded_at < $2::timestamptz`,
      [pr.start.toISOString(), pr.endExclusive.toISOString()]
    );

    const invoiceAgg = await pool.query<{
      pending_amount_cents: number;
      pending_cnt: number;
      overdue_amount_cents: number;
      overdue_cnt: number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN b.status = 'pending'
                              AND (b.due_at IS NULL OR b.due_at >= CURRENT_DATE OR b.amount_cents = 0)
                           THEN b.amount_cents ELSE 0 END), 0)::int AS pending_amount_cents,
         COALESCE(SUM(CASE WHEN b.status = 'pending'
                              AND b.due_at IS NOT NULL
                              AND b.due_at < CURRENT_DATE
                              AND b.amount_cents > 0
                           THEN b.amount_cents ELSE 0 END), 0)::int AS overdue_amount_cents,
         COUNT(*) FILTER (WHERE b.status = 'pending'
                              AND (b.due_at IS NULL OR b.due_at >= CURRENT_DATE OR b.amount_cents = 0))::int AS pending_cnt,
         COUNT(*) FILTER (WHERE b.status = 'pending'
                              AND b.due_at IS NOT NULL
                              AND b.due_at < CURRENT_DATE
                              AND b.amount_cents > 0)::int AS overdue_cnt
       FROM public.billing_invoices b`,
      []
    );

    const avgRes = await pool.query<{ avg_days: number | null }>(
      `SELECT AVG(EXTRACT(EPOCH FROM (tx.recorded_at - b.issued_at)) / 86400.0)::float AS avg_days
       FROM public.billing_transactions tx
       JOIN public.billing_invoices b ON b.id = tx.invoice_id
       WHERE tx.status = 'paid'
         AND tx.recorded_at >= $1::timestamptz
         AND tx.recorded_at < $2::timestamptz`,
      [pr.start.toISOString(), pr.endExclusive.toISOString()]
    );

    const rawAvg = avgRes.rows[0]?.avg_days ?? null;
    const avgCollectionDays = rawAvg === null ? null : Math.max(0, Math.round(rawAvg * 10) / 10);

    return {
      period: pr.label,
      paidAmountCents: paidAgg.rows[0]?.amount_cents ?? 0,
      paidCount: paidAgg.rows[0]?.cnt ?? 0,
      pendingAmountCents: invoiceAgg.rows[0]?.pending_amount_cents ?? 0,
      pendingCount: invoiceAgg.rows[0]?.pending_cnt ?? 0,
      overdueAmountCents: invoiceAgg.rows[0]?.overdue_amount_cents ?? 0,
      overdueCount: invoiceAgg.rows[0]?.overdue_cnt ?? 0,
      avgCollectionDays,
    };
  }

  async receiptsKpis(input: { period: RevenueDashboardPeriod }): Promise<{
    period: { startDate: string; endDateExclusive: string };
    receiptsIssuedAllTime: number;
    receiptsIssuedThisPeriod: number;
    confirmedAmountCentsThisPeriod: number;
    pendingCount: number;
  }> {
    const pool = requirePool();
    const pr = periodRange({ period: input.period });

    const allRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM public.billing_receipts r`,
      []
    );
    const perRes = await pool.query<{ cnt: number; amount_cents: number }>(
      `SELECT COUNT(*)::int AS cnt,
              COALESCE(SUM(r.amount_cents), 0)::int AS amount_cents
       FROM public.billing_receipts r
       WHERE r.issued_at >= $1::timestamptz
         AND r.issued_at < $2::timestamptz`,
      [pr.start.toISOString(), pr.endExclusive.toISOString()]
    );
    const pendingRes = await pool.query<{ pending_cnt: number }>(
      `SELECT COUNT(*) FILTER (WHERE b.status = 'pending'
                                AND (b.due_at IS NULL OR b.due_at >= CURRENT_DATE OR b.amount_cents = 0))::int AS pending_cnt
       FROM public.billing_invoices b`,
      []
    );

    return {
      period: pr.label,
      receiptsIssuedAllTime: allRes.rows[0]?.total ?? 0,
      receiptsIssuedThisPeriod: perRes.rows[0]?.cnt ?? 0,
      confirmedAmountCentsThisPeriod: perRes.rows[0]?.amount_cents ?? 0,
      pendingCount: pendingRes.rows[0]?.pending_cnt ?? 0,
    };
  }

  async listTempleOptions(): Promise<
    Array<{ tenantId: string; name: string; portalUrl: string; adminEmail: string; adminName: string }>
  > {
    const pool = requirePool();
    const { rows } = await pool.query<{
      tenant_id: string;
      name: string;
      slug: string;
      admin_email: string;
      admin_full_name: string | null;
    }>(
      `SELECT t.tenant_id, t.name, t.slug, t.admin_email, u.full_name AS admin_full_name
       FROM public.temples t
       LEFT JOIN public.users u ON lower(u.email) = lower(t.admin_email)
       ORDER BY t.created_at DESC, t.tenant_id::text DESC`
    );
    return rows.map((r) => {
      const adminEmail = r.admin_email?.trim() ?? "";
      const adminName =
        r.admin_full_name?.trim() || (adminEmail ? displayNameFromEmail(adminEmail) : "Temple Admin");
      return {
        tenantId: r.tenant_id,
        name: r.name,
        portalUrl: r.slug,
        adminEmail,
        adminName,
      };
    });
  }

  async generateInvoice(input: {
    tenantId: string;
    planName: string;
    billingCycleRaw: string;
    issueDate: string;
    dueDate: string;
    description: string;
    sendEmail: boolean;
  }): Promise<{
    invoiceId: string;
    invoiceNumber: string;
    amountCents: number;
    currency: string;
    status: InvoiceStatus;
    emailed: boolean;
    adminEmail: string;
    templeName: string;
  }> {
    const pool = requirePool();
    const tenantId = input.tenantId.trim();
    if (!tenantId) throw new Error("Missing tenantId");
    const planName = input.planName.trim() || "Sankalpa";
    const billingCycle = toBillingCycleStore(input.billingCycleRaw);
    const issuedAt = (input.issueDate || "").trim() || new Date().toISOString().slice(0, 10);
    const description = (input.description ?? "").trim();

    const templeRes = await pool.query<{ name: string; admin_email: string }>(
      `SELECT name, admin_email
       FROM public.temples
       WHERE tenant_id = $1
       LIMIT 1`,
      [tenantId]
    );
    const temple = templeRes.rows[0];
    if (!temple) throw new Error("Temple not found");

    const pr = await pool.query<{ price_monthly: number; price_yearly: number }>(
      `SELECT price_monthly, price_yearly
       FROM public.pricing_plans
       WHERE name = $1
       LIMIT 1`,
      [planName]
    );
    if (pr.rows.length === 0) throw new Error(`Pricing plan not found for name: ${planName}`);
    const amountCents = billingCycle === "Annual" ? pr.rows[0]!.price_yearly : pr.rows[0]!.price_monthly;
    const dueAt =
      (input.dueDate || "").trim() || computeDefaultDueDate(issuedAt, amountCents) || null;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const invoiceId = randomUUID();
      const invoiceNumber = await nextInvoiceNumber(client);
      await client.query(
        `INSERT INTO public.billing_invoices (
           id, tenant_id, invoice_number, plan, billing_cycle, amount_cents, currency, status, is_trial_proforma, issued_at, due_at, metadata
         ) VALUES ($1, $2, $3, $4, $5, $6, 'USD', 'pending', false, $7::date, $8::date, $9::jsonb)`,
        [
          invoiceId,
          tenantId,
          invoiceNumber,
          planName,
          billingCycle,
          amountCents,
          issuedAt,
          dueAt,
          JSON.stringify({ description }),
        ]
      );
      await client.query("COMMIT");

      return {
        invoiceId,
        invoiceNumber,
        amountCents,
        currency: "USD",
        status: "pending",
        emailed: false,
        adminEmail: temple.admin_email,
        templeName: temple.name,
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async getInvoiceEmailContext(id: string): Promise<{
    to: string;
    templeName: string;
    invoiceNumber: string;
    amountCents: number;
    isTrialProforma: boolean;
    planName: string;
    dueDate: string | null;
  } | null> {
    const pool = requirePool();
    const { rows } = await pool.query<{
      invoice_number: string;
      amount_cents: number;
      is_trial_proforma: boolean;
      plan: string;
      due_at: string | null;
      temple_name: string;
      admin_email: string;
    }>(
      `SELECT
         b.invoice_number,
         b.amount_cents,
         b.is_trial_proforma,
         b.plan,
         b.due_at::text AS due_at,
         t.name AS temple_name,
         t.admin_email
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       WHERE b.id = $1::uuid
       LIMIT 1`,
      [id.trim()]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      to: r.admin_email,
      templeName: r.temple_name,
      invoiceNumber: r.invoice_number,
      amountCents: r.amount_cents,
      isTrialProforma: r.is_trial_proforma,
      planName: r.plan,
      dueDate: r.due_at,
    };
  }

  async revenueDashboard(input: { period: RevenueDashboardPeriod }): Promise<{
    period: { startDate: string; endDateExclusive: string };
    kpis: {
      paidAmountCents: number;
      paidCount: number;
      pendingAmountCents: number;
      pendingCount: number;
      overdueAmountCents: number;
      overdueCount: number;
      activeTemples: number;
      trialTemples: number;
    };
    revenueByPlan: Array<{
      plan: string;
      billingCycle: string;
      unitAmountCents: number;
      count: number;
      amountCents: number;
    }>;
    trend: Array<{
      monthKey: string;
      monthLabel: string;
      isCurrent: boolean;
      unitAmountCents: number;
      count: number;
      amountCents: number;
    }>;
    subscriptionSummary: Array<{
      tenantId: string;
      templeName: string;
      location: string;
      portalUrl: string;
      plan: string;
      billingCycle: string;
      amountCents: number;
      status: "active" | "pending" | "trial";
      nextRenewal: string | null;
    }>;
  }> {
    const pool = requirePool();
    const pr = periodRange({ period: input.period });
    const start = pr.start;
    const endExclusive = pr.endExclusive;
    const period = pr.label;
    const now = new Date();
    const thisMonthStart = startOfUtcMonth(now);

    const paidAgg = await pool.query<{ amount_cents: number; cnt: number }>(
      `SELECT COALESCE(SUM(tx.amount_cents), 0)::int AS amount_cents,
              COUNT(*)::int AS cnt
       FROM public.billing_transactions tx
       WHERE tx.status = 'paid'
         AND tx.recorded_at >= $1::timestamptz
         AND tx.recorded_at < $2::timestamptz`,
      [start.toISOString(), endExclusive.toISOString()]
    );

    const invoiceAgg = await pool.query<{
      pending_amount_cents: number;
      pending_cnt: number;
      overdue_amount_cents: number;
      overdue_cnt: number;
    }>(
      `SELECT
         COALESCE(SUM(CASE WHEN b.status = 'pending'
                              AND (b.due_at IS NULL OR b.due_at >= CURRENT_DATE OR b.amount_cents = 0)
                           THEN b.amount_cents ELSE 0 END), 0)::int AS pending_amount_cents,
         COALESCE(SUM(CASE WHEN b.status = 'pending'
                              AND b.due_at IS NOT NULL
                              AND b.due_at < CURRENT_DATE
                              AND b.amount_cents > 0
                           THEN b.amount_cents ELSE 0 END), 0)::int AS overdue_amount_cents,
         COUNT(*) FILTER (WHERE b.status = 'pending'
                              AND (b.due_at IS NULL OR b.due_at >= CURRENT_DATE OR b.amount_cents = 0))::int AS pending_cnt,
         COUNT(*) FILTER (WHERE b.status = 'pending'
                              AND b.due_at IS NOT NULL
                              AND b.due_at < CURRENT_DATE
                              AND b.amount_cents > 0)::int AS overdue_cnt
       FROM public.billing_invoices b`,
      []
    );

    const templeAgg = await pool.query<{ active: number; trial: number }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Active')::int AS active,
         COUNT(*) FILTER (WHERE status = 'Trial')::int AS trial
       FROM public.temples`,
      []
    );

    const byPlanRes = await pool.query<{
      plan: string;
      billing_cycle: string;
      amount_cents: number;
      cnt: number;
      unit_amount_cents: number;
    }>(
      `SELECT b.plan,
              b.billing_cycle,
              COALESCE(SUM(tx.amount_cents), 0)::int AS amount_cents,
              COUNT(*)::int AS cnt,
              COALESCE(ROUND(AVG(tx.amount_cents))::int, 0) AS unit_amount_cents
       FROM public.billing_transactions tx
       JOIN public.billing_invoices b ON b.id = tx.invoice_id
       WHERE tx.status = 'paid'
         AND tx.recorded_at >= $1::timestamptz
         AND tx.recorded_at < $2::timestamptz
       GROUP BY b.plan, b.billing_cycle
       ORDER BY amount_cents DESC, b.plan ASC, b.billing_cycle ASC`,
      [start.toISOString(), endExclusive.toISOString()]
    );

    const trendMonthCount = 3;
    const trendStart = addUtcMonths(thisMonthStart, -(trendMonthCount - 1));
    const currentMonthKey = utcMonthKey(thisMonthStart);
    const trendRes = await pool.query<{ month: string; amount_cents: number; cnt: number }>(
      `SELECT to_char(date_trunc('month', tx.recorded_at), 'YYYY-MM') AS month,
              COALESCE(SUM(tx.amount_cents), 0)::int AS amount_cents,
              COUNT(*)::int AS cnt
       FROM public.billing_transactions tx
       WHERE tx.status = 'paid'
         AND tx.recorded_at >= $1::timestamptz
       GROUP BY 1
       ORDER BY 1 ASC`,
      [trendStart.toISOString()]
    );
    const trendByMonth = new Map(trendRes.rows.map((r) => [r.month, r]));
    const trendMonthSlots = Array.from({ length: trendMonthCount }, (_, i) =>
      addUtcMonths(trendStart, i)
    );

    const summaryRes = await pool.query<{
      tenant_id: string;
      temple_name: string;
      city: string;
      country_code: string;
      slug: string;
      temple_status: string;
      sub_plan: string | null;
      sub_cycle: string | null;
      sub_amount: number | null;
      sub_status: string | null;
      sub_expires_on: string | null;
    }>(
      `SELECT
         t.tenant_id,
         t.name AS temple_name,
         t.city,
         t.country_code,
         t.slug,
         t.status AS temple_status,
         s.plan AS sub_plan,
         s.billing_cycle AS sub_cycle,
         s.amount AS sub_amount,
         s.status AS sub_status,
         s.expires_on::text AS sub_expires_on
       FROM public.temples t
       LEFT JOIN LATERAL (
         SELECT s.*
         FROM public.subscriptions s
         WHERE s.tenant_id = t.tenant_id
         ORDER BY s.payment_date DESC, s.created_at DESC
         LIMIT 1
       ) s ON true
       ORDER BY t.created_at DESC, t.tenant_id::text DESC`,
      []
    );

    const subscriptionSummary = summaryRes.rows.map((r) => {
      const trial = r.temple_status === "Trial";
      const pending = !trial && r.sub_status === "Pending";
      const status: "active" | "pending" | "trial" = trial ? "trial" : pending ? "pending" : "active";
      const amountCents = Math.max(0, Math.trunc((r.sub_amount ?? 0) * 100));
      return {
        tenantId: r.tenant_id,
        templeName: r.temple_name,
        location: `${r.city}, ${r.country_code}`,
        portalUrl: r.slug,
        plan: r.sub_plan ?? "—",
        billingCycle: r.sub_cycle ?? "—",
        amountCents,
        status,
        nextRenewal: r.sub_expires_on,
      };
    });

    return {
      period,
      kpis: {
        paidAmountCents: paidAgg.rows[0]?.amount_cents ?? 0,
        paidCount: paidAgg.rows[0]?.cnt ?? 0,
        pendingAmountCents: invoiceAgg.rows[0]?.pending_amount_cents ?? 0,
        pendingCount: invoiceAgg.rows[0]?.pending_cnt ?? 0,
        overdueAmountCents: invoiceAgg.rows[0]?.overdue_amount_cents ?? 0,
        overdueCount: invoiceAgg.rows[0]?.overdue_cnt ?? 0,
        activeTemples: templeAgg.rows[0]?.active ?? 0,
        trialTemples: templeAgg.rows[0]?.trial ?? 0,
      },
      revenueByPlan: byPlanRes.rows.map((r) => ({
        plan: r.plan,
        billingCycle: formatBillingCycleChartLabel(r.billing_cycle),
        unitAmountCents: r.unit_amount_cents,
        count: r.cnt,
        amountCents: r.amount_cents,
      })),
      trend: trendMonthSlots.map((d) => {
        const monthKey = utcMonthKey(d);
        const row = trendByMonth.get(monthKey);
        const count = row?.cnt ?? 0;
        const amountCents = row?.amount_cents ?? 0;
        const unitAmountCents = count > 0 ? Math.round(amountCents / count) : 0;
        const isCurrent = monthKey === currentMonthKey;
        return {
          monthKey,
          monthLabel: monthKeyToChartLabel(monthKey, isCurrent),
          isCurrent,
          unitAmountCents,
          count,
          amountCents,
        };
      }),
      subscriptionSummary,
    };
  }

  async listInvoices(input: ListInvoicesInput): Promise<{
    data: InvoiceListRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const pool = requirePool();
    const q = (input.q ?? "").trim().toLowerCase();
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: unknown[] = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(
        `(LOWER(t.name) LIKE ${p} OR LOWER(b.invoice_number) LIKE ${p} OR LOWER(t.admin_email) LIKE ${p})`
      );
    }
    if (input.status === "awaiting" || input.status === "pending") {
      where.push(`b.status = 'pending'`);
    } else if (input.status === "paid") {
      where.push(`b.status = 'paid'`);
    } else if (input.status === "overdue") {
      where.push(
        `b.status = 'pending' AND b.due_at IS NOT NULL AND b.due_at < (CURRENT_DATE) AND b.amount_cents > 0`
      );
    } else if (input.status === "draft") {
      where.push(`(b.status = 'proforma' OR b.status = 'void' OR b.status = 'rejected')`);
    } else if (input.status === "proforma" || input.status === "void" || input.status === "rejected") {
      where.push(`b.status = $${params.length + 1}`);
      params.push(input.status);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       ${whereSql}`,
      params
    );
    const total = countRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const lim = pageSize;
    const off = offset;

    const dataRes = await pool.query<{
      id: string;
      tenant_id: string;
      invoice_number: string;
      plan: string;
      billing_cycle: string;
      amount_cents: number;
      currency: string;
      status: string;
      is_trial_proforma: boolean;
      issued_at: string;
      due_at: string | null;
      name: string;
      city: string;
      country_code: string;
      admin_email: string;
    }>(
      `SELECT
         b.id::text AS id,
         b.tenant_id::text AS tenant_id,
         b.invoice_number,
         b.plan,
         b.billing_cycle,
         b.amount_cents,
         b.currency,
         b.status,
         b.is_trial_proforma,
         b.issued_at::text AS issued_at,
         b.due_at::text AS due_at,
         t.name,
         t.city,
         t.country_code,
         t.admin_email
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       ${whereSql}
       ORDER BY b.issued_at DESC, b.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, lim, off]
    );

    const addressByTenant = await fetchTempleStreetAddressesByTenantIds(
      dataRes.rows.map((r) => r.tenant_id)
    );

    const data: InvoiceListRow[] = dataRes.rows.map((r) => {
      const fa = addressByTenant.get(r.tenant_id) ?? "";
      const uist = invoiceUiStatus({
        status: r.status,
        is_trial_proforma: r.is_trial_proforma,
        due_at: r.due_at,
        amount_cents: r.amount_cents,
      });
      return {
        id: r.id,
        num: r.invoice_number,
        temple: r.name,
        templeLocation: `${r.city}, ${r.country_code}`,
        templeAddress: fa,
        adminEmail: r.admin_email,
        plan: r.plan,
        period: r.billing_cycle === "Annual" ? "Yearly" : "Monthly",
        amountCents: r.amount_cents,
        issuedDate: r.issued_at,
        dueDate: r.due_at,
        status: uist,
        currency: r.currency,
        isTrialProforma: r.is_trial_proforma,
      };
    });

    return { data, total, page, pageSize, totalPages };
  }

  async getInvoiceById(id: string): Promise<InvoiceListRow | null> {
    const pool = requirePool();
    const { rows } = await pool.query<{
      id: string;
      tenant_id: string;
      invoice_number: string;
      plan: string;
      billing_cycle: string;
      amount_cents: number;
      currency: string;
      status: string;
      is_trial_proforma: boolean;
      issued_at: string;
      due_at: string | null;
      name: string;
      city: string;
      country_code: string;
      admin_email: string;
    }>(
      `SELECT
         b.id::text AS id,
         b.tenant_id::text AS tenant_id,
         b.invoice_number,
         b.plan,
         b.billing_cycle,
         b.amount_cents,
         b.currency,
         b.status,
         b.is_trial_proforma,
         b.issued_at::text AS issued_at,
         b.due_at::text AS due_at,
         t.name,
         t.city,
         t.country_code,
         t.admin_email
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       WHERE b.id = $1
       LIMIT 1`,
      [id.trim()]
    );
    const r = rows[0];
    if (!r) return null;
    const addressByTenant = await fetchTempleStreetAddressesByTenantIds([r.tenant_id]);
    const fa = addressByTenant.get(r.tenant_id) ?? "";
    return {
      id: r.id,
      num: r.invoice_number,
      temple: r.name,
      templeLocation: `${r.city}, ${r.country_code}`,
      templeAddress: fa,
      adminEmail: r.admin_email,
      plan: r.plan,
      period: r.billing_cycle === "Annual" ? "Yearly" : "Monthly",
      amountCents: r.amount_cents,
      issuedDate: r.issued_at,
      dueDate: r.due_at,
      status: invoiceUiStatus({
        status: r.status,
        is_trial_proforma: r.is_trial_proforma,
        due_at: r.due_at,
        amount_cents: r.amount_cents,
      }),
      currency: r.currency,
      isTrialProforma: r.is_trial_proforma,
    };
  }

  async listTransactions(input: {
    q: string;
    status: "all" | "paid" | "pending" | "overdue";
    plan: string;
    period?: RevenueDashboardPeriod;
    page: number;
    pageSize: number;
  }): Promise<{
    data: Array<{
      id: string;
      date: string;
      temple: string;
      templeLocation: string;
      templeInitials: string;
      invoiceId: string;
      invoiceRef: string;
      plan: string;
      amountCents: number;
      currency: string;
      method: string;
      status: "paid" | "pending" | "overdue";
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const pool = requirePool();
    const q = (input.q ?? "").trim().toLowerCase();
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const planFilter = input.plan !== "all" && input.plan.trim() ? input.plan.trim() : "";
    const pr = periodRange({ period: input.period ?? "this-month" });
    const usePeriod = Boolean(input.period);

    function initials(name: string): string {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const a = parts[0]?.[0] ?? "";
      const b = parts.length > 1 ? parts[1]![0] : (parts[0]?.[1] ?? "");
      return (a + b).toUpperCase() || "T";
    }

    const params: unknown[] = [];
    const txFilters: string[] = [`tx.status = 'paid'`];
    const subFilters: string[] = [`s.status = 'pending'`, `s.invoice_id IS NOT NULL`];

    if (usePeriod) {
      params.push(pr.start.toISOString());
      const pStart = `$${params.length}`;
      params.push(pr.endExclusive.toISOString());
      const pEnd = `$${params.length}`;
      txFilters.push(`tx.recorded_at >= ${pStart}::timestamptz AND tx.recorded_at < ${pEnd}::timestamptz`);
      subFilters.push(`s.created_at >= ${pStart}::timestamptz AND s.created_at < ${pEnd}::timestamptz`);
    }

    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      const nameInvoiceFilter = `(LOWER(t.name) LIKE ${p} OR LOWER(b.invoice_number) LIKE ${p})`;
      txFilters.push(nameInvoiceFilter);
      subFilters.push(nameInvoiceFilter);
    }
    if (planFilter) {
      params.push(planFilter);
      const p = `$${params.length}`;
      txFilters.push(`b.plan = ${p}`);
      subFilters.push(`b.plan = ${p}`);
    }

    const statusFilter =
      input.status === "paid" || input.status === "pending" || input.status === "overdue" ? input.status : "all";
    if (statusFilter !== "all") {
      params.push(statusFilter);
    }

    const unionSql = `
      WITH merged AS (
        SELECT
          tx.id::text AS id,
          tx.recorded_at AS sort_ts,
          t.name,
          t.city,
          t.country_code,
          b.invoice_number,
          b.id::text AS invoice_id,
          b.plan,
          b.amount_cents,
          b.currency,
          CASE
            WHEN b.status = 'paid' THEN 'paid'
            WHEN b.status = 'pending'
                 AND b.due_at IS NOT NULL
                 AND b.amount_cents > 0
                 AND b.due_at < CURRENT_DATE
              THEN 'overdue'
            WHEN b.status = 'pending' THEN 'pending'
            ELSE 'pending'
          END AS ui_status
        FROM public.billing_transactions tx
        JOIN public.temples t ON t.tenant_id = tx.tenant_id
        JOIN public.billing_invoices b ON b.id = tx.invoice_id
        WHERE ${txFilters.join(" AND ")}

        UNION ALL

        SELECT
          ('sub:' || s.id::text) AS id,
          s.created_at AS sort_ts,
          t.name,
          t.city,
          t.country_code,
          b.invoice_number,
          b.id::text AS invoice_id,
          b.plan,
          b.amount_cents,
          b.currency,
          CASE
            WHEN b.status = 'paid' THEN 'paid'
            WHEN b.status = 'pending'
                 AND b.due_at IS NOT NULL
                 AND b.amount_cents > 0
                 AND b.due_at < CURRENT_DATE
              THEN 'overdue'
            WHEN b.status = 'pending' THEN 'pending'
            ELSE 'pending'
          END AS ui_status
        FROM public.temple_payment_submission_index s
        JOIN public.temples t ON t.tenant_id = s.tenant_id
        JOIN public.billing_invoices b ON b.id = s.invoice_id
        WHERE ${subFilters.join(" AND ")}
      )
    `;

    const statusWhere = statusFilter === "all" ? "" : `WHERE ui_status = $${params.length}`;

    const countRes = await pool.query<{ total: number }>(
      `${unionSql}
       SELECT COUNT(*)::int AS total
       FROM merged
       ${statusWhere}`,
      params
    );
    const total = countRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * pageSize;

    const pageRes = await pool.query<{
      id: string;
      sort_ts: string;
      name: string;
      city: string;
      country_code: string;
      invoice_number: string;
      invoice_id: string;
      plan: string;
      amount_cents: number;
      currency: string;
      ui_status: "paid" | "pending" | "overdue";
    }>(
      `${unionSql}
       SELECT
         id,
         sort_ts::text AS sort_ts,
         name,
         city,
         country_code,
         invoice_number,
         invoice_id,
         plan,
         amount_cents,
         currency,
         ui_status
       FROM merged
       ${statusWhere}
       ORDER BY sort_ts DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    const data = pageRes.rows.map((r) => ({
      id: r.id,
      date: new Date(r.sort_ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      temple: r.name,
      templeLocation: `${r.city}, ${r.country_code}`,
      templeInitials: initials(r.name),
      invoiceId: r.invoice_id,
      invoiceRef: r.invoice_number,
      plan: r.plan,
      amountCents: r.amount_cents,
      currency: r.currency,
      method: "Bank transfer",
      status: r.ui_status,
    }));

    return { data, total, page: safePage, pageSize, totalPages };
  }

  async listReceipts(input: { q: string; period?: RevenueDashboardPeriod; page: number; pageSize: number }): Promise<{
    data: Array<{
      id: string;
      num: string;
      temple: string;
      templeLocation: string;
      invoiceRef: string;
      plan: string;
      amountCents: number;
      paymentDate: string;
      method: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const pool = requirePool();
    const q = (input.q ?? "").trim().toLowerCase();
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const offset = (page - 1) * pageSize;
    const period = input.period;
    const pr = periodRange({ period: period ?? "this-month" });
    const usePeriod = Boolean(period);
    const params: unknown[] = [];
    const where: string[] = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(
        `(LOWER(t.name) LIKE ${p} OR LOWER(r.receipt_number) LIKE ${p} OR LOWER(b.invoice_number) LIKE ${p})`
      );
    }
    if (usePeriod) {
      params.push(pr.start.toISOString());
      const pStart = `$${params.length}`;
      params.push(pr.endExclusive.toISOString());
      const pEnd = `$${params.length}`;
      where.push(`(r.issued_at >= ${pStart}::timestamptz AND r.issued_at < ${pEnd}::timestamptz)`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM public.billing_receipts r
       JOIN public.temples t ON t.tenant_id = r.tenant_id
       JOIN public.billing_invoices b ON b.id = r.invoice_id
       ${whereSql}`,
      params
    );
    const total = countRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const dataRes = await pool.query<{
      id: string;
      receipt_number: string;
      name: string;
      city: string;
      country_code: string;
      invoice_number: string;
      plan: string;
      amount_cents: number;
      issued_at: string;
    }>(
      `SELECT
         r.id::text AS id,
         r.receipt_number,
         t.name,
         t.city,
         t.country_code,
         b.invoice_number,
         b.plan,
         r.amount_cents,
         r.issued_at
       FROM public.billing_receipts r
       JOIN public.temples t ON t.tenant_id = r.tenant_id
       JOIN public.billing_invoices b ON b.id = r.invoice_id
       ${whereSql}
       ORDER BY r.issued_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    const data = dataRes.rows.map((r) => ({
      id: r.id,
      num: r.receipt_number,
      temple: r.name,
      templeLocation: `${r.city}, ${r.country_code}`,
      invoiceRef: r.invoice_number,
      plan: r.plan,
      amountCents: r.amount_cents,
      paymentDate: new Date(r.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      method: "Bank transfer",
    }));
    return { data, total, page, pageSize, totalPages };
  }

  async getReceiptDetail(id: string): Promise<{
    id: string;
    num: string;
    invoiceRef: string;
    temple: string;
    templeLine: string;
    portal: string;
    email: string;
    plan: string;
    amountCents: number;
    currency: string;
    paymentRef: string;
    method: string;
    periodFrom: string;
    periodTo: string;
    nextRenewal: string;
    description: string;
    paymentDate: string;
    generatedAt: string;
  } | null> {
    const pool = requirePool();
    const simple = await pool.query<{
      id: string;
      receipt_number: string;
      invoice_number: string;
      name: string;
      city: string;
      country_code: string;
      domain_subdomain: string | null;
      admin_email: string;
      plan: string;
      billing_cycle: string;
      amount_cents: number;
      currency: string;
      issued_at: string;
    }>(
      `SELECT
         r.id::text AS id,
         r.receipt_number,
         b.invoice_number,
         t.name,
         t.city,
         t.country_code,
         t.domain_subdomain,
         t.admin_email,
         b.plan,
         b.billing_cycle,
         r.amount_cents,
         r.currency,
         r.issued_at
       FROM public.billing_receipts r
       JOIN public.billing_invoices b ON b.id = r.invoice_id
       JOIN public.temples t ON t.tenant_id = r.tenant_id
       WHERE r.id = $1::uuid`,
      [id.trim()]
    );
    const srow = simple.rows[0];
    if (!srow) return null;

    const payRef = await pool.query<{ payment_ref: string }>(
      `SELECT ps.payment_ref
       FROM public.billing_receipts r0
       JOIN public.billing_transactions tx ON tx.id = r0.transaction_id
       LEFT JOIN public.temple_payment_submission_index ps ON ps.id = tx.payment_submission_id
       WHERE r0.id = $1::uuid`,
      [id.trim()]
    );
    const paymentRef = payRef.rows[0]?.payment_ref ?? "—";

    const from = new Date(srow.issued_at);
    const to =
      srow.billing_cycle === "Annual" ? addYears(from, 1) : addMonths(from, 1);
    return {
      id: srow.id,
      num: srow.receipt_number,
      invoiceRef: srow.invoice_number,
      temple: srow.name,
      templeLine: `${srow.name} — ${srow.city}`,
      portal: srow.domain_subdomain
        ? `${(srow.domain_subdomain ?? "").replace(/\.omkaarya\.com$/i, "")}.omkaarya.com`
        : "—",
      email: srow.admin_email,
      plan: `${srow.plan} (${srow.billing_cycle === "Annual" ? "Yearly" : "Monthly"})`,
      amountCents: srow.amount_cents,
      currency: srow.currency,
      paymentRef,
      method: "Bank transfer",
      periodFrom: from.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      periodTo: to.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      nextRenewal: to.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      description: `${srow.plan} — ${srow.billing_cycle === "Annual" ? "Annual" : "Monthly"} subscription`,
      paymentDate: from.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      generatedAt: from.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + " UTC",
    };
  }
}

// --- payment submission: attach invoice in same transaction as insert ---

export type AttachPayableInvoiceInput = {
  submissionId: string;
  tenantId: string;
  amountCents: number;
  currency: string;
  optionalInvoiceId?: string | null;
};

export type AttachPayableInvoiceResult =
  | { ok: true; invoiceId: string }
  | { ok: false; reason: "no_payable_invoice" | "amount_mismatch" | "not_found" };

export async function attachPayableInvoiceToSubmission(
  platformClient: PoolClient,
  opsClient: PoolClient,
  input: AttachPayableInvoiceInput
): Promise<AttachPayableInvoiceResult> {
  const { submissionId, tenantId, amountCents, currency } = input;
  const wantInv = (input.optionalInvoiceId ?? "").trim();

  if (wantInv) {
    const v = await platformClient.query<{
      id: string;
      amount_cents: number;
      currency: string;
      status: string;
    }>(
      `SELECT id::text AS id, amount_cents, currency, status
       FROM public.billing_invoices
       WHERE id = $1::uuid AND tenant_id = $2
       LIMIT 1`,
      [wantInv, tenantId]
    );
    if (v.rows.length === 0) return { ok: false, reason: "not_found" };
    const inv = v.rows[0]!;
    if (inv.status !== "pending" || inv.amount_cents <= 0) return { ok: false, reason: "no_payable_invoice" };
    if (inv.amount_cents !== amountCents || inv.currency.toUpperCase() !== currency.trim().toUpperCase()) {
      return { ok: false, reason: "amount_mismatch" };
    }
    await opsClient.query(`UPDATE temple_payment_submissions SET invoice_id = $1::uuid WHERE id = $2::uuid`, [
      inv.id,
      submissionId,
    ]);
    return { ok: true, invoiceId: inv.id };
  }

  const open = await platformClient.query<{
    id: string;
    amount_cents: number;
    currency: string;
  }>(
    `SELECT id::text AS id, amount_cents, currency
     FROM public.billing_invoices
     WHERE tenant_id = $1
       AND status = 'pending'
       AND (NOT is_trial_proforma)
       AND amount_cents > 0
     ORDER BY issued_at DESC
     LIMIT 1`,
    [tenantId]
  );
  if (open.rows.length === 0) return { ok: false, reason: "no_payable_invoice" };
  const inv = open.rows[0]!;
  if (inv.amount_cents !== amountCents || inv.currency.toUpperCase() !== currency.trim().toUpperCase()) {
    return { ok: false, reason: "amount_mismatch" };
  }
  await opsClient.query(`UPDATE temple_payment_submissions SET invoice_id = $1::uuid WHERE id = $2::uuid`, [
    inv.id,
    submissionId,
  ]);
  return { ok: true, invoiceId: inv.id };
}

export type PendingPaymentRow = {
  id: string;
  temple: string;
  location: string;
  plan: string;
  amountCents: number;
  currency: string;
  invoiceId: string | null;
  invoiceRef: string | null;
  paymentRef: string;
  createdAt: string;
  submitted: string;
  note: string;
  slipUrl: string;
};

export async function listPendingPaymentSubmissionsForConfirm(): Promise<PendingPaymentRow[]> {
  const pool = requirePool();
  const { rows } = await pool.query<{
    id: string;
    name: string;
    city: string;
    country_code: string;
    plan: string;
    amount_cents: number;
    currency: string;
    payment_ref: string;
    created_at: string;
    notes: string | null;
    storage_public_url: string;
    invoice_id: string | null;
    invoice_number: string | null;
  }>(
    `SELECT
       s.id::text AS id,
       t.name,
       t.city,
       t.country_code,
       COALESCE(b.plan, t.plan) AS plan,
       s.amount_cents,
       s.currency,
       s.payment_ref,
       s.created_at,
       s.notes,
       s.storage_public_url,
       s.invoice_id::text AS invoice_id,
       b.invoice_number
     FROM public.temple_payment_submission_index s
     JOIN public.temples t ON t.tenant_id = s.tenant_id
     LEFT JOIN public.billing_invoices b ON b.id = s.invoice_id
     WHERE s.status = 'pending'
     ORDER BY s.created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    temple: r.name,
    location: `${r.city}, ${r.country_code}`,
    plan: r.plan,
    amountCents: r.amount_cents,
    currency: r.currency,
    invoiceId: r.invoice_id,
    invoiceRef: r.invoice_number,
    paymentRef: r.payment_ref,
    createdAt: r.created_at,
    submitted: new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    note: (r.notes ?? "").trim() || "—",
    slipUrl: r.storage_public_url,
  }));
}

export type ConfirmPaymentResult =
  | {
      ok: true;
      receiptNumber: string;
      invoiceNumber: string;
      amountCents: number;
      currency: string;
      adminEmail: string;
      templeName: string;
    }
  | { ok: false; reason: "not_found" | "bad_state" | "not_linked" };

export async function confirmPaymentSubmission(
  submissionId: string,
  verifiedBy: string
): Promise<ConfirmPaymentResult> {
  const pool = requirePool();
  const client = await pool.connect();
  const actor = verifiedBy.trim() || "System";
  try {
    await client.query("BEGIN");
    const s = await client.query<{
      id: string;
      status: string;
      tenant_id: string;
      invoice_id: string | null;
      amount_cents: number;
      currency: string;
    }>(
      `SELECT id::text, status, tenant_id, invoice_id::text, amount_cents, currency
       FROM public.temple_payment_submission_index
       WHERE id = $1::uuid
       FOR UPDATE`,
      [submissionId]
    );
    if (s.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const sub = s.rows[0]!;
    if (sub.status !== "pending") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "bad_state" };
    }
    if (!sub.invoice_id) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_linked" };
    }

    const invr = await client.query<{
      id: string;
      amount_cents: number;
      status: string;
      plan: string;
      billing_cycle: string;
      invoice_number: string;
    }>(
      `SELECT id::text, amount_cents, status, plan, billing_cycle, invoice_number
       FROM public.billing_invoices
       WHERE id = $1::uuid
       FOR UPDATE`,
      [sub.invoice_id]
    );
    if (invr.rows.length === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }
    const inv = invr.rows[0]!;
    if (inv.status === "paid") {
      await client.query("ROLLBACK");
      return { ok: false, reason: "bad_state" };
    }
    if (inv.amount_cents !== sub.amount_cents) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_linked" };
    }

    const tRes = await client.query<{ name: string; admin_email: string }>(
      `SELECT name, admin_email FROM public.temples WHERE tenant_id = $1`,
      [sub.tenant_id]
    );
    const temple = tRes.rows[0]!;

    const txId = randomUUID();
    const rcId = randomUUID();
    const receiptNumber = await nextReceiptNumber(client);

    await client.query(
      `UPDATE public.temple_payment_submission_index
       SET status = 'approved'
       WHERE id = $1::uuid`,
      [sub.id]
    );
    await client.query(
      `UPDATE public.billing_invoices
       SET status = 'paid', due_at = COALESCE(due_at, (CURRENT_DATE))
       WHERE id = $1::uuid`,
      [inv.id]
    );

    const paidDay = new Date();
    const payDate = paidDay.toISOString().slice(0, 10);
    const expDate =
      inv.billing_cycle === "Annual"
        ? addYears(paidDay, 1).toISOString().slice(0, 10)
        : addMonths(paidDay, 1).toISOString().slice(0, 10);

    await client.query(
      `INSERT INTO public.billing_transactions (
         id, tenant_id, invoice_id, payment_submission_id, amount_cents, currency, method, status, recorded_at
       ) VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, 'bank_transfer', 'paid', NOW())`,
      [txId, sub.tenant_id, inv.id, sub.id, inv.amount_cents, sub.currency]
    );
    await client.query(
      `INSERT INTO public.billing_receipts (
         id, tenant_id, invoice_id, transaction_id, receipt_number, amount_cents, currency, issued_at
       ) VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, NOW())`,
      [rcId, sub.tenant_id, inv.id, txId, receiptNumber, inv.amount_cents, sub.currency]
    );

    const amtDollars = Math.round(inv.amount_cents / 100);
    await client.query(
      `UPDATE public.subscriptions
       SET status = 'Active',
           receipt_id = $2,
           verified_by = $3,
           activated_on = $4::date,
           payment_date = $4::date,
           expires_on = $5::date,
           amount = $6
       WHERE invoice_id = $1::uuid`,
      [inv.id, receiptNumber, actor, payDate, expDate, amtDollars]
    );

    await client.query(
      `UPDATE public.temples SET status = 'Active' WHERE tenant_id = $1`,
      [sub.tenant_id]
    );

    await client.query("COMMIT");

    const opsPool = await getOperationalPoolForTenant(sub.tenant_id);
    if (opsPool) {
      try {
        await opsPool.query(`UPDATE temple_payment_submissions SET status = 'approved' WHERE id = $1::uuid`, [
          submissionId,
        ]);
      } catch (e) {
        console.error("[confirmPaymentSubmission] ops status sync failed:", e);
      }
    }

    return {
      ok: true,
      receiptNumber,
      invoiceNumber: inv.invoice_number,
      amountCents: inv.amount_cents,
      currency: sub.currency,
      adminEmail: temple.admin_email,
      templeName: temple.name,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function rejectPaymentSubmission(
  submissionId: string
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "bad_state" }> {
  const pool = requirePool();
  const res = await pool.query(
    `UPDATE public.temple_payment_submission_index
     SET status = 'rejected'
     WHERE id = $1::uuid AND status = 'pending'`,
    [submissionId]
  );
  if (res.rowCount === 0) {
    const ex = await pool.query(`SELECT 1 FROM public.temple_payment_submission_index WHERE id = $1::uuid`, [
      submissionId,
    ]);
    if (ex.rowCount === 0) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "bad_state" };
  }
  const t = await pool.query<{ tenant_id: string }>(
    `SELECT tenant_id FROM public.temple_payment_submission_index WHERE id = $1::uuid`,
    [submissionId]
  );
  const tenantId = t.rows[0]?.tenant_id;
  if (tenantId) {
    const opsPool = await getOperationalPoolForTenant(tenantId);
    if (opsPool) {
      try {
        await opsPool.query(`UPDATE temple_payment_submissions SET status = 'rejected' WHERE id = $1::uuid`, [
          submissionId,
        ]);
      } catch (e) {
        console.error("[rejectPaymentSubmission] ops status sync failed:", e);
      }
    }
  }
  return { ok: true };
}

export type TempleOpenInvoice = {
  id: string;
  invoiceNumber: string;
  plan: string;
  amountCents: number;
  currency: string;
  status: string;
  dueAt: string | null;
};

export async function listOpenInvoicesForTempleSession(input: { sessionEmail: string; templeId: string }): Promise<TempleOpenInvoice[]> {
  const pool = requirePool();
  const { rows } = await pool.query<{
    id: string;
    invoice_number: string;
    plan: string;
    amount_cents: number;
    currency: string;
    status: string;
    due_at: string | null;
  }>(
    `SELECT
       b.id::text, b.invoice_number, b.plan, b.amount_cents, b.currency, b.status, b.due_at::text
     FROM public.billing_invoices b
     JOIN public.temples ON temples.tenant_id = b.tenant_id
     WHERE b.tenant_id = $1
       AND b.status = 'pending'
       AND b.amount_cents > 0
       AND (NOT b.is_trial_proforma)
       AND ${sqlTempleMatchesSessionEmail(2)}
     ORDER BY b.created_at DESC, b.issued_at DESC`,
    [input.templeId.trim(), input.sessionEmail.trim()]
  );
  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    plan: r.plan,
    amountCents: r.amount_cents,
    currency: r.currency,
    status: r.status,
    dueAt: r.due_at,
  }));
}