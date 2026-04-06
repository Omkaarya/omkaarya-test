import { getPool } from "../db/pool.js";

export type SaveAdminProfileInput = {
  sessionEmail: string;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
};

export type TempleAdminProfileRecord = {
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
};

export type SaveAdminProfileResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "email_taken" };

export class PostgresTempleAdminProfileRepository {
  async getAdminProfileByEmail(email: string): Promise<TempleAdminProfileRecord | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const e = email.trim();
    if (!e) return null;

    const res = await pool.query<{
      email: string;
      full_name: string | null;
      whatsapp: string | null;
      roles: string[] | null;
    }>(
      `SELECT email, full_name, whatsapp, roles
       FROM public.users
       WHERE email = $1
       LIMIT 1`,
      [e]
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      email: row.email,
      fullName: row.full_name ?? "",
      phone: row.whatsapp ?? "",
      roles: Array.isArray(row.roles) ? row.roles : [],
    };
  }

  async saveAdminProfile(input: SaveAdminProfileInput): Promise<SaveAdminProfileResult> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const sessionEmail = input.sessionEmail.trim();
    const nextEmail = input.email.trim();
    const fullName = input.fullName.trim();
    const phone = input.phone.trim();
    const roles = input.roles;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const exists = await client.query<{ id: number }>(
        "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
        [sessionEmail]
      );
      if (exists.rows.length === 0) {
        await client.query("ROLLBACK");
        return { ok: false, reason: "not_found" };
      }

      if (nextEmail !== sessionEmail) {
        const taken = await client.query<{ id: number }>(
          "SELECT id FROM public.users WHERE email = $1 AND email <> $2 LIMIT 1",
          [nextEmail, sessionEmail]
        );
        if (taken.rows.length > 0) {
          await client.query("ROLLBACK");
          return { ok: false, reason: "email_taken" };
        }

        await client.query(
          `UPDATE public.temples SET admin_email = $1 WHERE admin_email = $2`,
          [nextEmail, sessionEmail]
        );

        await client.query(
          `UPDATE public.users
           SET email = $1, full_name = $2, whatsapp = $3, roles = $4
           WHERE email = $5`,
          [nextEmail, fullName, phone, roles, sessionEmail]
        );
      } else {
        await client.query(
          `UPDATE public.users
           SET full_name = $1, whatsapp = $2, roles = $3
           WHERE email = $4`,
          [fullName, phone, roles, sessionEmail]
        );
      }

      await client.query("COMMIT");
      return { ok: true };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
