import { getPool } from "../db/pool.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";
import type { TemplePlan } from "./types.js";

const TIER_TO_PLAN: Record<"basic" | "business" | "enterprise", TemplePlan> = {
  basic: "Aaaradhana",
  business: "Sankalpa",
  enterprise: "Mandala",
};

/** Maps UI tier ids from `lib/temple-pricing-plans.ts` to `temples.plan` CHECK values. */
export function mapOnboardingTierToPlan(tier: "basic" | "business" | "enterprise"): TemplePlan {
  return TIER_TO_PLAN[tier];
}

export type SaveTemplePlanSelectionInput = {
  sessionEmail: string;
  templeId: string;
  planId: "basic" | "business" | "enterprise";
  billing: "monthly" | "annual";
  confirmedAt: Date | null;
};

export type SaveTemplePlanSelectionResult =
  | { ok: true }
  | { ok: false; reason: "not_found" };

export class PostgresTemplePlanRepository {
  async savePlanSelection(input: SaveTemplePlanSelectionInput): Promise<SaveTemplePlanSelectionResult> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }

    const sessionEmail = input.sessionEmail.trim();
    const tenantId = input.templeId.trim();
    const mappedPlan = mapOnboardingTierToPlan(input.planId);
    const confirmedAt = input.confirmedAt ?? new Date();

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE public.temples
         SET plan = $1,
             billing_cycle = $2,
             onboarding_plan_tier = $3,
             plan_confirmed_at = $4
         WHERE tenant_id = $5 AND ${sqlTempleMatchesSessionEmail(6)}`,
        [mappedPlan, input.billing, input.planId, confirmedAt, tenantId, sessionEmail]
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
