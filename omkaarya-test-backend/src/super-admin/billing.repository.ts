import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type InvoiceStatus = "proforma" | "pending" | "paid" | "void" | "rejected";
export type BillingCycleStore = "Monthly" | "Annual";

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Map wizard "Annually" to DB and subscriptions UI. */
export function toBillingCycleStore(raw: string | null | undefined): BillingCycleStore {
  const s = (raw ?? "").trim();
  if (s === "Annually" || s === "Annual" || s === "Yearly" || s === "yearly") return "Annual";
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

export async function nextInvoiceNumber(client: Pick<PoolClient, "query">): Promise<string> {
  const y = new Date().getUTCFullYear();
  const { rows } = await client.query<{ seq: string }>(`SELECT nextval('public.billing_invoice_number_seq')::text AS seq`);
  const n = String(rows[0]?.seq ?? "1");
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
  templeName: string;
  /** Raw from wizard: "Monthly" | "Annually" */
  billingCycleRaw: string;
  trial: boolean;
};

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
  const planName = input.planName.trim() || "Sankalpa";
  const bcStore = toBillingCycleStore(input.billingCycleRaw);

  const pr = await client.query<{
    price_monthly: number;
    price_yearly: number;
  }>(`SELECT price_monthly, price_yearly FROM public.pricing_plans WHERE name = $1 LIMIT 1`, [planName]);
  if (pr.rows.length === 0) {
    throw new Error(`Pricing plan not found for name: ${planName}`);
  }
  const { price_monthly, price_yearly } = pr.rows[0]!;

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

  const amountCents = bcStore === "Annual" ? price_yearly : price_monthly;
  const issued = new Date();
  const due = new Date(issued);
  due.setDate(due.getDate() + 14);

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
      due.toISOString().slice(0, 10),
      JSON.stringify({ templeName: input.templeName }),
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
    dueDate: due.toISOString().slice(0, 10),
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
  async listInvoices(input: ListInvoicesInput): Promise<{
    data: InvoiceListRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");
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
      full_address: unknown;
      admin_email: string;
    }>(
      `SELECT
         b.id::text AS id,
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
         t.full_address,
         t.admin_email
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       ${whereSql}
       ORDER BY b.issued_at DESC, b.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, lim, off]
    );

    const data: InvoiceListRow[] = dataRes.rows.map((r) => {
      const fa =
        r.full_address && typeof r.full_address === "object" && "street" in (r.full_address as object)
          ? String((r.full_address as { street?: string }).street ?? "")
          : "";
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
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");
    const { rows } = await pool.query<{
      id: string;
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
      full_address: unknown;
      admin_email: string;
    }>(
      `SELECT
         b.id::text AS id,
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
         t.full_address,
         t.admin_email
       FROM public.billing_invoices b
       JOIN public.temples t ON t.tenant_id = b.tenant_id
       WHERE b.id = $1
       LIMIT 1`,
      [id.trim()]
    );
    const r = rows[0];
    if (!r) return null;
    const fa =
      r.full_address && typeof r.full_address === "object" && "street" in (r.full_address as object)
        ? String((r.full_address as { street?: string }).street ?? "")
        : "";
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
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");
    const q = (input.q ?? "").trim().toLowerCase();
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const planFilter = input.plan !== "all" && input.plan.trim() ? input.plan.trim() : "";

    function initials(name: string): string {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const a = parts[0]?.[0] ?? "";
      const b = parts.length > 1 ? parts[1]![0] : (parts[0]?.[1] ?? "");
      return (a + b).toUpperCase() || "T";
    }
    function rowSt(
      bStatus: string,
      due: string | null,
      amt: number
    ): "paid" | "pending" | "overdue" {
      if (bStatus === "paid") return "paid";
      if (bStatus === "pending" && due && amt > 0) {
        if (new Date(due) < new Date(new Date().toDateString())) return "overdue";
      }
      if (bStatus === "pending") return "pending";
      return "pending";
    }

    const paid: Array<{
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
      b_status: string;
      b_due: string | null;
    }> = [];
    if (input.status === "all" || input.status === "paid") {
      const p: unknown[] = [];
      const w: string[] = [];
      if (q) {
        p.push(`%${q}%`);
        w.push(`(LOWER(t.name) LIKE $${p.length} OR LOWER(b.invoice_number) LIKE $${p.length})`);
      }
      if (planFilter) {
        p.push(planFilter);
        w.push(`b.plan = $${p.length}`);
      }
      const whereSql = w.length ? `AND ${w.join(" AND ")}` : "";
      const { rows } = await pool.query<{
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
        b_status: string;
        b_due: string | null;
      }>(
        `SELECT
           tx.id::text AS id,
           tx.recorded_at::text AS sort_ts,
           t.name, t.city, t.country_code,
           b.invoice_number, b.id::text AS invoice_id, b.plan,
           b.amount_cents, b.currency, b.status AS b_status, b.due_at::text AS b_due
         FROM public.billing_transactions tx
         JOIN public.temples t ON t.tenant_id = tx.tenant_id
         JOIN public.billing_invoices b ON b.id = tx.invoice_id
         WHERE tx.status = 'paid' ${whereSql}
         ORDER BY tx.recorded_at DESC`,
        p
      );
      for (const r of rows) {
        if (input.status === "paid" && rowSt(r.b_status, r.b_due, r.amount_cents) !== "paid") continue;
        paid.push(r);
      }
    }

    const pend: typeof paid = [];
    if (input.status === "all" || input.status === "pending" || input.status === "overdue") {
      const p: unknown[] = [];
      const w: string[] = [
        `s.status = 'pending'`,
        `b.status = 'pending'`,
        `s.invoice_id IS NOT NULL`,
      ];
      if (q) {
        p.push(`%${q}%`);
        w.push(`(LOWER(t.name) LIKE $${p.length} OR LOWER(b.invoice_number) LIKE $${p.length})`);
      }
      if (planFilter) {
        p.push(planFilter);
        w.push(`b.plan = $${p.length}`);
      }
      if (input.status === "overdue") {
        w.push(`b.due_at IS NOT NULL AND b.due_at < (CURRENT_DATE) AND b.amount_cents > 0`);
      } else if (input.status === "pending") {
        w.push(
          `(b.due_at IS NULL OR b.due_at >= (CURRENT_DATE) OR b.amount_cents = 0)`
        );
      }
      const { rows } = await pool.query<{
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
        b_status: string;
        b_due: string | null;
      }>(
        `SELECT
           ('sub:' || s.id::text) AS id,
           s.created_at::text AS sort_ts,
           t.name, t.city, t.country_code,
           b.invoice_number, b.id::text AS invoice_id, b.plan,
           b.amount_cents, b.currency, b.status AS b_status, b.due_at::text AS b_due
         FROM public.temple_payment_submissions s
         JOIN public.temples t ON t.tenant_id = s.tenant_id
         JOIN public.billing_invoices b ON b.id = s.invoice_id
         WHERE ${w.join(" AND ")}
         ORDER BY s.created_at DESC`,
        p
      );
      for (const r of rows) {
        const st = rowSt(r.b_status, r.b_due, r.amount_cents);
        if (input.status === "overdue" && st !== "overdue") continue;
        if (input.status === "pending" && (st === "overdue" || st === "paid")) continue;
        pend.push(r);
      }
    }

    const merged = [...pend, ...paid].sort(
      (a, b) => new Date(b.sort_ts).getTime() - new Date(a.sort_ts).getTime()
    );
    const total = merged.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const slice = merged.slice((page - 1) * pageSize, page * pageSize);
    const data = slice.map((r) => ({
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
      status: rowSt(r.b_status, r.b_due, r.amount_cents),
    }));
    return { data, total, page, pageSize, totalPages };
  }

  async listReceipts(input: { q: string; page: number; pageSize: number }): Promise<{
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
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");
    const q = (input.q ?? "").trim().toLowerCase();
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const offset = (page - 1) * pageSize;
    const params: unknown[] = [];
    const where: string[] = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(
        `(LOWER(t.name) LIKE ${p} OR LOWER(r.receipt_number) LIKE ${p} OR LOWER(b.invoice_number) LIKE ${p})`
      );
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
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");
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
       LEFT JOIN public.temple_payment_submissions ps ON ps.id = tx.payment_submission_id
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
  client: PoolClient,
  input: AttachPayableInvoiceInput
): Promise<AttachPayableInvoiceResult> {
  const { submissionId, tenantId, amountCents, currency } = input;
  const wantInv = (input.optionalInvoiceId ?? "").trim();

  if (wantInv) {
    const v = await client.query<{
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
    await client.query(
      `UPDATE public.temple_payment_submissions SET invoice_id = $1::uuid WHERE id = $2::uuid`,
      [inv.id, submissionId]
    );
    return { ok: true, invoiceId: inv.id };
  }

  const open = await client.query<{
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
  await client.query(
    `UPDATE public.temple_payment_submissions SET invoice_id = $1::uuid WHERE id = $2::uuid`,
    [inv.id, submissionId]
  );
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
  submitted: string;
  note: string;
  slipUrl: string;
};

export async function listPendingPaymentSubmissionsForConfirm(): Promise<PendingPaymentRow[]> {
  const pool = getPool();
  if (!pool) throw new Error("Database pool is not available");
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
     FROM public.temple_payment_submissions s
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
  const pool = getPool();
  if (!pool) throw new Error("Database pool is not available");
  const client = await pool.connect();
  const actor = verifiedBy.trim() || "Super Admin";
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
       FROM public.temple_payment_submissions
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
      `UPDATE public.temple_payment_submissions
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

    await client.query("COMMIT");
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
  const pool = getPool();
  if (!pool) throw new Error("Database pool is not available");
  const res = await pool.query(
    `UPDATE public.temple_payment_submissions
     SET status = 'rejected'
     WHERE id = $1::uuid AND status = 'pending'`,
    [submissionId]
  );
  if (res.rowCount === 0) {
    const ex = await pool.query(`SELECT 1 FROM public.temple_payment_submissions WHERE id = $1::uuid`, [submissionId]);
    if (ex.rowCount === 0) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "bad_state" };
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
  const pool = getPool();
  if (!pool) throw new Error("Database pool is not available");
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
       AND ${sqlTempleMatchesSessionEmail(2)}`,
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