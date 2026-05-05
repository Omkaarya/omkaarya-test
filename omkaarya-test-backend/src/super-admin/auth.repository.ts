import bcrypt from "bcryptjs";
import { getPool } from "../db/pool.js";
import { HttpError } from "../middleware/http-error.js";
import { syncTempleAuthMirrorFromEmail } from "../temple-ops/sync-auth-mirror.js";

export type LoginResult =
  | { ok: false }
  | { ok: true; firstLogin: boolean; userId: number; tenantId: string | null };

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  setPermanentPassword(email: string, tempPassword: string, newPassword: string): Promise<boolean>;
}

export class PostgresAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<LoginResult> {
    const pool = getPool();
    if (!pool) {
      return { ok: false };
    }
    const client = await pool.connect();
    try {
      const normalized = email.trim();
      const result = await client.query<{
        id: number;
        tenant_id: string | null;
        temp_password: string | null;
        password_hash: string | null;
      }>(
        `SELECT id, tenant_id, temp_password, password_hash
           FROM public.users
          WHERE lower(trim(email)) = lower(trim($1))
          LIMIT 1`,
        [normalized]
      );
      if (result.rows.length === 0) {
        return { ok: false };
      }
      const row = result.rows[0]!;
      if (row.password_hash) {
        const match = await bcrypt.compare(password, row.password_hash);
        return match
          ? {
              ok: true,
              firstLogin: false,
              userId: row.id,
              tenantId: row.tenant_id,
            }
          : { ok: false };
      }
      if (row.temp_password != null && row.temp_password === password) {
        return {
          ok: true,
          firstLogin: true,
          userId: row.id,
          tenantId: row.tenant_id,
        };
      }
      return { ok: false };
    } finally {
      client.release();
    }
  }

  async setPermanentPassword(email: string, tempPassword: string, newPassword: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return false;
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const client = await pool.connect();
    let updated = false;
    try {
      const result = await client.query(
        `UPDATE public.users
         SET password_hash = $1, temp_password = NULL
         WHERE lower(trim(email)) = lower(trim($2))
           AND temp_password = $3
           AND password_hash IS NULL`,
        [hash, email.trim(), tempPassword]
      );
      updated = result.rowCount === 1;
    } finally {
      client.release();
    }

    if (updated) {
      try {
        await syncTempleAuthMirrorFromEmail(email.trim());
      } catch (e) {
        if (process.env.TEMPLE_AUTH_SYNC_REQUIRED?.trim() === "1") {
          const reason = e instanceof Error ? e.message : String(e);
          throw new HttpError(500, "Password updated but temple credential mirror failed.", {
            code: "TEMPLE_MIRROR_SYNC_FAILED",
            reason,
          });
        }
        console.warn("[auth] temple auth mirror sync after setPermanentPassword skipped/failed:", e);
      }
    }

    return updated;
  }
}
