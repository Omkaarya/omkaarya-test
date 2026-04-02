import { getPool } from "../db/pool.js";

export interface AuthRepository {
  verifyInvitationCredentials(email: string, tempPassword: string): Promise<boolean>;
}

/**
 * `SELECT ... FROM users WHERE email = $1 AND temp_password = $2`
 */
export class PostgresAuthRepository implements AuthRepository {
  async verifyInvitationCredentials(email: string, tempPassword: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return false;
    }
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT 1 FROM public.users WHERE email = $1 AND temp_password = $2 LIMIT 1",
        [email, tempPassword]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }
}
