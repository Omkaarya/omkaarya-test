import bcrypt from "bcryptjs";
import { getPool } from "../db/pool.js";

export type LoginResult =
  | { ok: false }
  | { ok: true; firstLogin: boolean };

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
      const result = await client.query<{ temp_password: string | null; password_hash: string | null }>(
        "SELECT temp_password, password_hash FROM public.users WHERE email = $1 LIMIT 1",
        [email.trim()]
      );
      if (result.rows.length === 0) {
        return { ok: false };
      }
      const row = result.rows[0]!;
      if (row.password_hash) {
        const match = await bcrypt.compare(password, row.password_hash);
        return match ? { ok: true, firstLogin: false } : { ok: false };
      }
      if (row.temp_password != null && row.temp_password === password) {
        return { ok: true, firstLogin: true };
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
    try {
      const result = await client.query(
        `UPDATE public.users
         SET password_hash = $1, temp_password = NULL
         WHERE email = $2 AND temp_password = $3 AND password_hash IS NULL`,
        [hash, email.trim(), tempPassword]
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  }
}
