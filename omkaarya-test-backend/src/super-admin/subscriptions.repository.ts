import { getPool } from "../db/pool.js";

export type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";

export type SubscriptionRow = {
  id: string;
  invoiceId: string | null;
  tenantId: string;
  templeName: string;
  plan: string;
  billingCycle: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  receiptId: string | null;
  status: SubscriptionStatus;
  verifiedBy: string | null;
  activatedOn: string | null; // YYYY-MM-DD
  expiresOn: string; // YYYY-MM-DD
  adminEmail: string;
};

export type ListSubscriptionsInput = {
  q: string;
  status: "All" | SubscriptionStatus;
  page: number;
  pageSize: number;
};

export type ListSubscriptionsResult = {
  data: SubscriptionRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UpcomingRenewalRow = {
  id: string;
  tenantId: string;
  templeName: string;
  location: string;
  plan: string;
  billingCycle: string;
  amountCents: number;
  renewalDate: string; // YYYY-MM-DD
  daysLeft: number;
  invoiceSent: boolean;
};

export type ListUpcomingRenewalsInput = {
  q: string;
  days: number;
  page: number;
  pageSize: number;
};

export type ListUpcomingRenewalsResult = {
  data: UpcomingRenewalRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export class PostgresSubscriptionsRepository {
  async list(input: ListSubscriptionsInput): Promise<ListSubscriptionsResult> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const q = (input.q ?? "").trim().toLowerCase();
    const status = input.status ?? "All";
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(LOWER(t.name) LIKE ${p} OR LOWER(s.plan) LIKE ${p} OR LOWER(COALESCE(s.receipt_id, '')) LIKE ${p})`);
    }
    if (status !== "All") {
      params.push(status);
      where.push(`s.status = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM public.subscriptions s
       JOIN public.temples t ON t.tenant_id = s.tenant_id
       ${whereSql}`,
      params
    );
    const total = totalRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    params.push(pageSize);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const rowsRes = await pool.query<{
      id: string;
      invoice_id: string | null;
      tenant_id: string;
      temple_name: string;
      plan: string;
      billing_cycle: string;
      amount: number;
      payment_date: string;
      receipt_id: string | null;
      status: SubscriptionStatus;
      verified_by: string | null;
      activated_on: string | null;
      expires_on: string;
      admin_email: string;
    }>(
      `SELECT
         s.id::text AS id,
         s.invoice_id::text AS invoice_id,
         s.tenant_id,
         t.name AS temple_name,
         s.plan,
         s.billing_cycle,
         s.amount,
         s.payment_date::text AS payment_date,
         s.receipt_id,
         s.status,
         s.verified_by,
         s.activated_on::text AS activated_on,
         s.expires_on::text AS expires_on,
         t.admin_email
       FROM public.subscriptions s
       JOIN public.temples t ON t.tenant_id = s.tenant_id
       ${whereSql}
       ORDER BY s.payment_date DESC, s.created_at DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params
    );

    return {
      data: rowsRes.rows.map((r) => ({
        id: r.id,
        invoiceId: r.invoice_id,
        tenantId: r.tenant_id,
        templeName: r.temple_name,
        plan: r.plan,
        billingCycle: r.billing_cycle,
        amount: r.amount,
        paymentDate: r.payment_date,
        receiptId: r.receipt_id,
        status: r.status,
        verifiedBy: r.verified_by,
        activatedOn: r.activated_on,
        expiresOn: r.expires_on,
        adminEmail: r.admin_email,
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async listUpcomingRenewals(input: ListUpcomingRenewalsInput): Promise<ListUpcomingRenewalsResult> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const q = (input.q ?? "").trim().toLowerCase();
    const days = clampInt(input.days ?? 60, 1, 365);
    const pageSize = clampInt(input.pageSize ?? 10, 1, 100);
    const page = clampInt(input.page ?? 1, 1, 10_000);
    const offset = (page - 1) * pageSize;

    const params: unknown[] = [];
    const where: string[] = [
      `s.status = 'Active'`,
      `s.expires_on >= CURRENT_DATE`,
      `s.expires_on < (CURRENT_DATE + ($1::int || ' days')::interval)`,
    ];
    params.push(days);

    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(LOWER(t.name) LIKE ${p} OR LOWER(s.plan) LIKE ${p})`);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const totalRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM public.subscriptions s
       JOIN public.temples t ON t.tenant_id = s.tenant_id
       ${whereSql}`,
      params
    );
    const total = totalRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    params.push(pageSize);
    const lim = `$${params.length}`;
    params.push(offset);
    const off = `$${params.length}`;

    const rowsRes = await pool.query<{
      id: string;
      tenant_id: string;
      temple_name: string;
      city: string;
      country_code: string;
      plan: string;
      billing_cycle: string;
      amount: number;
      expires_on: string;
      invoice_sent: boolean;
      days_left: number;
    }>(
      `SELECT
         s.id::text AS id,
         s.tenant_id,
         t.name AS temple_name,
         t.city,
         t.country_code,
         s.plan,
         s.billing_cycle,
         s.amount,
         s.expires_on::text AS expires_on,
         (s.expires_on - CURRENT_DATE)::int AS days_left,
         EXISTS (
           SELECT 1
           FROM public.billing_invoices b
           WHERE b.tenant_id = s.tenant_id
             AND b.issued_at >= (s.expires_on - INTERVAL '45 days')::date
             AND b.issued_at <= s.expires_on
             AND b.status IN ('pending','paid')
         ) AS invoice_sent
       FROM public.subscriptions s
       JOIN public.temples t ON t.tenant_id = s.tenant_id
       ${whereSql}
       ORDER BY s.expires_on ASC, t.name ASC
       LIMIT ${lim} OFFSET ${off}`,
      params
    );

    return {
      data: rowsRes.rows.map((r) => ({
        id: r.id,
        tenantId: r.tenant_id,
        templeName: r.temple_name,
        location: `${r.city}, ${r.country_code}`,
        plan: r.plan,
        billingCycle: r.billing_cycle,
        amountCents: Math.max(0, Math.trunc((r.amount ?? 0) * 100)),
        renewalDate: r.expires_on,
        daysLeft: Math.max(0, Math.trunc(r.days_left ?? 0)),
        invoiceSent: Boolean(r.invoice_sent),
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async verify(id: string, verifiedBy: string): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const subId = id.trim();
    const actor = verifiedBy.trim() || "Super Admin";

    const res = await pool.query(
      `UPDATE public.subscriptions
       SET status = 'Active',
           verified_by = $2,
           activated_on = COALESCE(activated_on, CURRENT_DATE)
       WHERE id = $1`,
      [subId, actor]
    );
    if (res.rowCount === 0) return { ok: false, reason: "not_found" };
    return { ok: true };
  }

  async reject(id: string, verifiedBy: string): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const subId = id.trim();
    const actor = verifiedBy.trim() || "Super Admin";

    const res = await pool.query(
      `UPDATE public.subscriptions
       SET status = 'Rejected',
           verified_by = $2
       WHERE id = $1`,
      [subId, actor]
    );
    if (res.rowCount === 0) return { ok: false, reason: "not_found" };
    return { ok: true };
  }
}
