import { getPool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";
import { updateTempleAdminOnboardingFlags } from "../temple-ops/temple-admin-data.js";

export type CompletePaymentOnboardingInput = {
  sessionEmail: string;
  templeId: string;
  saveCardPreferred: boolean;
};

export type CompletePaymentOnboardingResult = { ok: true } | { ok: false; reason: "not_found" };

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

    const gate = await pool.query<{ tenant_id: string }>(
      `SELECT tenant_id FROM public.temples
       WHERE tenant_id = $1 AND ${sqlTempleMatchesSessionEmail(2)}
       LIMIT 1`,
      [tenantId, sessionEmail]
    );
    if (gate.rows.length === 0) {
      return { ok: false, reason: "not_found" };
    }

    const opsPool = await getOperationalPoolForTenant(tenantId);
    if (!opsPool) {
      return { ok: false, reason: "not_found" };
    }

    const client = await opsPool.connect();
    try {
      await client.query(`INSERT INTO temple_admin_data (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
      await updateTempleAdminOnboardingFlags(client, {
        paymentOnboardingCompletedAt: new Date(),
        paymentSaveCardPreference: input.saveCardPreferred,
      });
      return { ok: true };
    } finally {
      client.release();
    }
  }
}
