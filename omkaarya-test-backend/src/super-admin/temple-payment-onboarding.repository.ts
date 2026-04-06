import { getPool } from "../db/pool.js";

export type CompletePaymentOnboardingInput = {
  sessionEmail: string;
  templeId: string;
  saveCardPreferred: boolean;
};

export type CompletePaymentOnboardingResult =
  | { ok: true }
  | { ok: false; reason: "not_found" };

export class PostgresTemplePaymentOnboardingRepository {
  async completePaymentOnboarding(
    input: CompletePaymentOnboardingInput
  ): Promise<CompletePaymentOnboardingResult> {
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
         SET payment_onboarding_completed_at = NOW(),
             payment_save_card_preference = $1
         WHERE tenant_id = $2 AND admin_email = $3`,
        [input.saveCardPreferred, tenantId, sessionEmail]
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
