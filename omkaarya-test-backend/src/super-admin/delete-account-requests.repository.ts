import { requirePool } from "../db/pool.js";

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

export class PostgresDeleteAccountRequestsRepository {
  async listPaged(params: ListDeleteAccountRequestsParams): Promise<ListDeleteAccountRequestsResult> {
    const pool = requirePool();
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

    const countRes = await pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.delete_account_requests WHERE ${whereSql}`,
      values
    );
    const totalFiltered = Number(countRes.rows[0]?.c ?? 0);

    const stats = await pool.query<{ total: string; pending: string; processed: string }>(
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

    const listRes = await pool.query<{
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

  async updateStatus(
    id: string,
    status: "Approved" | "Rejected",
    reviewedBy?: string
  ): Promise<{ ok: true } | { ok: false; reason: "not_found" | "not_pending" }> {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query<{
        tenant_id: string | null;
        email: string;
        status: string;
      }>(
        `SELECT tenant_id, email, status FROM public.delete_account_requests WHERE id = $1::uuid LIMIT 1`,
        [id]
      );
      const row = existing.rows[0];
      if (!row) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "not_found" };
      }
      if (row.status !== "Pending") {
        await client.query("ROLLBACK");
        return { ok: false, reason: "not_pending" };
      }

      const res = await client.query<{ id: string }>(
        `UPDATE public.delete_account_requests
         SET status = $1, updated_at = NOW()
         WHERE id = $2::uuid AND status = 'Pending'
         RETURNING id`,
        [status, id]
      );
      if (res.rowCount === 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "not_pending" };
      }

      if (status === "Approved") {
        if (row.tenant_id) {
          await client.query(
            `UPDATE public.temples SET status = 'Suspended' WHERE tenant_id = $1`,
            [row.tenant_id]
          );
          await client.query(
            `UPDATE public.users SET roles = (
               SELECT COALESCE(array_agg(r), ARRAY[]::text[])
               FROM unnest(COALESCE(roles, ARRAY[]::text[])) AS r
               WHERE lower(trim(r)) NOT IN ('temple admin', 'admin')
             )
             WHERE tenant_id = $1`,
            [row.tenant_id]
          );
        }
        await client.query(
          `UPDATE public.users
           SET temp_password = NULL,
               password_hash = NULL
           WHERE lower(trim(email)) = lower(trim($1))`,
          [row.email]
        );
      }

      await client.query("COMMIT");
      void reviewedBy;
      return { ok: true };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
