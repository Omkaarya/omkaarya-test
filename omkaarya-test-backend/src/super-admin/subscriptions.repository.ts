import { getPool } from "../db/pool.js";

export type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";

export type SubscriptionRow = {
  id: string;
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
