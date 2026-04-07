import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

export type SaveTempleDeitySelectionInput = {
  sessionEmail: string;
  templeId: string;
  primaryDeityId: string;
  subDeityIds: string[];
  customDeityNote: string | null;
  preferCustomLater: boolean | null;
};

export type SaveTempleDeitySelectionResult =
  | { ok: true }
  | { ok: false; reason: "not_found" };

export class PostgresTempleDeityRepository {
  async saveDeitySelection(input: SaveTempleDeitySelectionInput): Promise<SaveTempleDeitySelectionResult> {
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
         SET primary_deity_id = $1,
             sub_deity_ids = $2,
             deity_custom_note = $3,
             deity_prefer_custom_later = $4
         WHERE tenant_id = $5 AND ${sqlTempleMatchesSessionEmail(6)}`,
        [
          input.primaryDeityId,
          input.subDeityIds,
          input.customDeityNote,
          input.preferCustomLater,
          tenantId,
          sessionEmail,
        ]
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
