import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";
import type { TemplePlan } from "./types.js";

const TIER_PLAN_NAMES: ReadonlySet<string> = new Set<TemplePlan>(["Prarambha", "Sankalpa", "Aaradhana"]);

function isValidTierPlanName(name: string): name is TemplePlan {
  return TIER_PLAN_NAMES.has(name);
}

export type SaveTemplePlanSelectionInput = {
  sessionEmail: string;
  templeId: string;
  pricingPlanId: string;
  billing: "monthly" | "annual";
  confirmedAt: Date | null;
};

export type SaveTemplePlanSelectionResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "invalid_plan" };

export class PostgresTemplePlanRepository {
  async savePlanSelection(input: SaveTemplePlanSelectionInput): Promise<SaveTemplePlanSelectionResult> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const sessionEmail = input.sessionEmail.trim();
    const tenantId = input.templeId.trim();
    const confirmedAt = input.confirmedAt ?? new Date();

    const planRow = await pool.query<{ name: string }>(
      `SELECT name FROM public.pricing_plans WHERE id = $1::uuid LIMIT 1`,
      [input.pricingPlanId]
    );
    if (planRow.rows.length === 0) {
      return { ok: false, reason: "invalid_plan" };
    }
    const name = planRow.rows[0]!.name.trim();
    if (!isValidTierPlanName(name)) {
      return { ok: false, reason: "invalid_plan" };
    }

    const result = await pool.query(
      `UPDATE public.temples
       SET plan = $1,
           billing_cycle = $2,
           pricing_plan_id = $3::uuid,
           onboarding_plan_tier = $4,
           plan_confirmed_at = $5
       WHERE tenant_id = $6 AND ${sqlTempleMatchesSessionEmail(7)}`,
      [name, input.billing, input.pricingPlanId, input.pricingPlanId, confirmedAt, tenantId, sessionEmail]
    );
    if (result.rowCount === 0) {
      return { ok: false, reason: "not_found" };
    }
    return { ok: true };
  }
}
