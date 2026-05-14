/**
 * Super-admin delete-account request queue — Postgres.
 */

import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";

export type DeleteAccountRequestRow = {
  id: string;
  tenantId: string | null;
  templeName: string;
  email: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: string;
  updatedAt: string;
};

export type ListDeleteAccountRequestsParams = {
  q: string;
  status: "All" | "Pending" | "Approved" | "Rejected";
  page: number;
  pageSize: number;
};

export type ListDeleteAccountRequestsResult = {
  items: DeleteAccountRequestRow[];
  totalFiltered: number;
  totalAll: number;
  pendingCount: number;
  processedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Database not configured. Set DATABASE_URL or DB env vars.");
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

function mapRow(r: {
  id: string;
  tenant_id: string | null;
  temple_name: string;
  email: string;
  reason: string;
  status: string;
  requested_at: Date;
  updated_at: Date;
}): DeleteAccountRequestRow {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    templeName: r.temple_name,
    email: r.email,
    reason: r.reason ?? "",
    status: r.status as DeleteAccountRequestRow["status"],
    requestedAt: r.requested_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
  };
}

export async function listDeleteAccountRequests(
  params: ListDeleteAccountRequestsParams
): Promise<ListDeleteAccountRequestsResult> {
  const p = getPool();
  const page = Math.max(1, params.page);
  const pageSize = Math.min(100, Math.max(1, params.pageSize));
  const offset = (page - 1) * pageSize;
  const q = params.q.trim();
  const status = params.status;

  const conditions: string[] = ["TRUE"];
  const values: unknown[] = [];

  if (status !== "All") {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    const n = values.length;
    conditions.push(`(temple_name ILIKE $${n} OR email ILIKE $${n})`);
  }

  const whereSql = conditions.join(" AND ");

  const countRes = await p.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM public.delete_account_requests WHERE ${whereSql}`,
    values
  );
  const totalFiltered = Number(countRes.rows[0]?.c ?? 0);

  const stats = await p.query<{ total: string; pending: string; processed: string }>(
    `SELECT
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE status = 'Pending')::text AS pending,
       COUNT(*) FILTER (WHERE status IN ('Approved', 'Rejected'))::text AS processed
     FROM public.delete_account_requests`
  );
  const totalAll = Number(stats.rows[0]?.total ?? 0);
  const pendingCount = Number(stats.rows[0]?.pending ?? 0);
  const processedCount = Number(stats.rows[0]?.processed ?? 0);

  const listParamBase = values.length;
  const listSql = `SELECT id, tenant_id, temple_name, email, reason, status, requested_at, updated_at
     FROM public.delete_account_requests
     WHERE ${whereSql}
     ORDER BY requested_at DESC
     LIMIT $${listParamBase + 1} OFFSET $${listParamBase + 2}`;

  const listRes = await p.query<{
    id: string;
    tenant_id: string | null;
    temple_name: string;
    email: string;
    reason: string;
    status: string;
    requested_at: Date;
    updated_at: Date;
  }>(listSql, [...values, pageSize, offset]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  return {
    items: listRes.rows.map(mapRow),
    totalFiltered,
    totalAll,
    pendingCount,
    processedCount,
    page,
    pageSize,
    totalPages,
  };
}

export async function updateDeleteAccountRequestStatus(
  id: string,
  status: "Approved" | "Rejected"
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "not_pending" }> {
  const p = getPool();
  const res = await p.query<{ id: string }>(
    `UPDATE public.delete_account_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2::uuid AND status = 'Pending'
     RETURNING id`,
    [status, id]
  );
  if (res.rowCount === 0) {
    const exists = await p.query(`SELECT 1 FROM public.delete_account_requests WHERE id = $1::uuid LIMIT 1`, [id]);
    if (exists.rowCount === 0) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "not_pending" };
  }
  return { ok: true };
}
