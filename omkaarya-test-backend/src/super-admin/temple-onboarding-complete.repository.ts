import { getPool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";
import { updateTempleAdminOnboardingFlags } from "../temple-ops/temple-admin-data.js";

export type CompleteTempleOnboardingInput = {
  sessionEmail: string;
  templeId: string;
};

export type CompleteTempleOnboardingResult = { ok: true } | { ok: false; reason: "not_found" };

export class PostgresTempleOnboardingCompleteRepository {
  async completeOnboarding(input: CompleteTempleOnboardingInput): Promise<CompleteTempleOnboardingResult> {
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

    const platformClient = await pool.connect();
    const opsClient = await opsPool.connect();
    try {
      await platformClient.query("BEGIN");
      await opsClient.query("BEGIN");

      await opsClient.query(`INSERT INTO temple_admin_data (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);
      await updateTempleAdminOnboardingFlags(opsClient, {
        onboardingCompletedAt: new Date(),
      });

      await platformClient.query(
        `UPDATE public.temples
         SET status = CASE
           WHEN status = 'Suspended' THEN status
           WHEN trial_ends_at IS NOT NULL AND trial_ends_at > NOW() THEN 'Trial'
           ELSE status
         END
         WHERE tenant_id = $1`,
        [tenantId]
      );

      await opsClient.query("COMMIT");
      await platformClient.query("COMMIT");
      return { ok: true };
    } catch (e) {
      await opsClient.query("ROLLBACK").catch(() => undefined);
      await platformClient.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      opsClient.release();
      platformClient.release();
    }
  }
}
