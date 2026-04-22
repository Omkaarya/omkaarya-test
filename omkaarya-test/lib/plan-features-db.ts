/**
 * Plan Features — Database layer
 * CRUD operations for the `plan_features` table (linking features to pricing plans).
 */

import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";

// ── Types ──────────────────────────────────────────────────────────

export type PlanFeature = {
  id: number;
  planId: string;
  featureId: number;
  featureName: string;
  featureKey: string;
  moduleKey: string;
  hasLimit: boolean;
  isEnabled: boolean;
  limitValue: number | null;
  createdAt: string;
};

export type PlanFeatureUpsert = {
  planId: string;
  featureId: number;
  isEnabled: boolean;
  limitValue?: number | null;
};

export type TenantFeatureAccess = {
  featureKey: string;
  moduleKey: string;
  enabled: boolean;
  limit: number | null;
};

// ── Pool ───────────────────────────────────────────────────────────

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Database not configured. Set DATABASE_URL or DB env vars.");
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

// ── Queries ────────────────────────────────────────────────────────

/** Fetch all feature configurations for a plan, joined with feature details. */
export async function fetchPlanFeatures(planId: string): Promise<PlanFeature[]> {
  const p = getPool();
  const result = await p.query(
    `SELECT pf.id, pf.plan_id, pf.feature_id, f.name AS feature_name, f.key AS feature_key,
            f.module_key, f.has_limit, pf.is_enabled, pf.limit_value, pf.created_at
     FROM public.plan_features pf
     JOIN public.features f ON f.id = pf.feature_id
     WHERE pf.plan_id = $1
     ORDER BY f.module_key, f.name`,
    [planId]
  );
  return result.rows.map((r: {
    id: number; plan_id: string; feature_id: number; feature_name: string;
    feature_key: string; module_key: string; has_limit: boolean;
    is_enabled: boolean; limit_value: number | null; created_at: string;
  }) => ({
    id: r.id,
    planId: r.plan_id,
    featureId: r.feature_id,
    featureName: r.feature_name,
    featureKey: r.feature_key,
    moduleKey: r.module_key,
    hasLimit: r.has_limit,
    isEnabled: r.is_enabled,
    limitValue: r.limit_value,
    createdAt: r.created_at,
  }));
}

/** Bulk upsert feature configs for a plan. */
export async function upsertPlanFeatures(items: PlanFeatureUpsert[]): Promise<void> {
  if (items.length === 0) return;
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      await client.query(
        `INSERT INTO public.plan_features (plan_id, feature_id, is_enabled, limit_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (plan_id, feature_id)
         DO UPDATE SET is_enabled = EXCLUDED.is_enabled, limit_value = EXCLUDED.limit_value`,
        [item.planId, item.featureId, item.isEnabled, item.limitValue ?? null]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Fetch effective features for a tenant (via their plan).
 * Joins temples → plan_features → features.
 *
 * **Backward compatibility:** If no plan_features exist for the tenant's plan,
 * returns empty array (caller should default to all-enabled).
 */
export async function fetchTenantFeatures(tenantId: string): Promise<TenantFeatureAccess[]> {
  const p = getPool();
  const result = await p.query(
    `SELECT f.key AS feature_key, f.module_key, pf.is_enabled AS enabled, pf.limit_value AS "limit"
     FROM public.temples t
     JOIN public.plan_features pf ON pf.plan_id = t.pricing_plan_id::text
     JOIN public.features f ON f.id = pf.feature_id AND f.is_active = true
     WHERE t.tenant_id = $1
       AND t.pricing_plan_id IS NOT NULL
     ORDER BY f.module_key, f.name`,
    [tenantId]
  );
  return result.rows.map((r: { feature_key: string; module_key: string; enabled: boolean; limit: number | null }) => ({
    featureKey: r.feature_key,
    moduleKey: r.module_key,
    enabled: r.enabled,
    limit: r.limit,
  }));
}
