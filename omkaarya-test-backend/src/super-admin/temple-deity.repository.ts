import { getPool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type SaveTempleDeitySelectionInput = {
  sessionEmail: string;
  templeId: string;
  primaryDeityId: string;
  subDeityIds: string[];
  customDeityNote: string | null;
  preferCustomLater: boolean | null;
};

export type SaveTempleDeitySelectionResult = { ok: true } | { ok: false; reason: "not_found" };

export class PostgresTempleDeityRepository {
  async saveDeitySelection(input: SaveTempleDeitySelectionInput): Promise<SaveTempleDeitySelectionResult> {
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
      await client.query(
        `UPDATE temple_admin_data
         SET primary_deity_id = $1,
             sub_deity_ids = $2,
             deity_custom_note = $3,
             deity_prefer_custom_later = $4,
             updated_at = NOW()
         WHERE id = 1`,
        [input.primaryDeityId, input.subDeityIds, input.customDeityNote, input.preferCustomLater]
      );
      return { ok: true };
    } finally {
      client.release();
    }
  }
}
