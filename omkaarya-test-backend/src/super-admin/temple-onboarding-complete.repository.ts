import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type CompleteTempleOnboardingInput = {
  sessionEmail: string;
  templeId: string;
};

export type CompleteTempleOnboardingResult =
  | { ok: true }
  | { ok: false; reason: "not_found" };

export class PostgresTempleOnboardingCompleteRepository {
  async completeOnboarding(input: CompleteTempleOnboardingInput): Promise<CompleteTempleOnboardingResult> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const sessionEmail = input.sessionEmail.trim();
    const tenantId = input.templeId.trim();

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE public.temples
         SET onboarding_completed_at = NOW()
         WHERE tenant_id = $1 AND ${sqlTempleMatchesSessionEmail(2)}`,
        [tenantId, sessionEmail]
      );
      if (result.rowCount === 0) {
        return { ok: false, reason: "not_found" };
      }
      return { ok: true };
    } finally {
      client.release();
    }
  }
}
