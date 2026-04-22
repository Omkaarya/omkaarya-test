/**
 * Feature Registry — Database layer
 * CRUD operations for the `features` table.
 *
 * Uses the same pg Pool pattern as temples-db.ts.
 */

import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";

// ── Types ──────────────────────────────────────────────────────────

export type LimitType = "number" | "boolean" | null;

export type Feature = {
  id: number;
  name: string;
  key: string;
  moduleKey: string;
  description: string;
  hasLimit: boolean;
  limitType: LimitType;
  isActive: boolean;
  isVisibleInPlanConfig: boolean;
  createdAt: string;
};

export type CreateFeatureInput = {
  name: string;
  key: string;
  moduleKey: string;
  description?: string;
  hasLimit?: boolean;
  limitType?: LimitType;
  isVisibleInPlanConfig?: boolean;
};

export type UpdateFeatureInput = Partial<Omit<CreateFeatureInput, "key">> & {
  isActive?: boolean;
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

/**
 * When a feature is deactivated: remove `plan_features` links and the feature `name` from
 * each `pricing_plans.features` JSON array so it disappears from plan UIs until re-activated.
 */
export async function removeFeatureFromAllPricingPlans(
  featureId: number,
  nameToRemoveFromJson: string
): Promise<void> {
  const p = getPool();
  await p.query(`DELETE FROM public.plan_features WHERE feature_id = $1`, [featureId]);
  const { rows } = await p.query<{ id: string; features: unknown }>(
    `SELECT id, features FROM public.pricing_plans`
  );
  for (const row of rows) {
    const arr = row.features;
    if (!Array.isArray(arr)) continue;
    const strs = arr.filter((x): x is string => typeof x === "string");
    if (!strs.includes(nameToRemoveFromJson)) continue;
    const next = strs.filter((n) => n !== nameToRemoveFromJson);
    await p.query(
      `UPDATE public.pricing_plans SET features = $1::jsonb, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(next), row.id]
    );
  }
}

// ── Row → Feature mapper ──────────────────────────────────────────

function rowToFeature(r: {
  id: number;
  name: string;
  key: string;
  module_key: string;
  description: string;
  has_limit: boolean;
  limit_type: string | null;
  is_active: boolean;
  is_visible_in_plan_config: boolean;
  created_at: string;
}): Feature {
  return {
    id: r.id,
    name: r.name,
    key: r.key,
    moduleKey: r.module_key,
    description: r.description ?? "",
    hasLimit: r.has_limit,
    limitType: r.limit_type as LimitType,
    isActive: r.is_active,
    isVisibleInPlanConfig: r.is_visible_in_plan_config,
    createdAt: r.created_at,
  };
}

// ── Queries ────────────────────────────────────────────────────────

/** Fetch all features (for Feature Registry admin page). */
export async function fetchAllFeatures(): Promise<Feature[]> {
  const p = getPool();
  const result = await p.query(
    `SELECT id, name, key, module_key, description, has_limit, limit_type,
            is_active, is_visible_in_plan_config, created_at
     FROM public.features
     ORDER BY module_key, name`
  );
  return result.rows.map(rowToFeature);
}

/** Active features only, registry order (for plan matrix / plan sync). */
export async function fetchAllActiveFeaturesOrdered(): Promise<Feature[]> {
  const rows = await fetchAllFeatures();
  return rows.filter((f) => f.isActive).sort((a, b) => {
    const mk = a.moduleKey.localeCompare(b.moduleKey);
    if (mk !== 0) return mk;
    return a.name.localeCompare(b.name);
  });
}

/** Fetch only active features visible in plan config (for Plan Config UI). */
export async function fetchVisibleFeatures(): Promise<Feature[]> {
  const p = getPool();
  const result = await p.query(
    `SELECT id, name, key, module_key, description, has_limit, limit_type,
            is_active, is_visible_in_plan_config, created_at
     FROM public.features
     WHERE is_active = true AND is_visible_in_plan_config = true
     ORDER BY module_key, name`
  );
  return result.rows.map(rowToFeature);
}

/** Insert a new feature. */
export async function insertFeature(input: CreateFeatureInput): Promise<Feature> {
  const p = getPool();
  const result = await p.query(
    `INSERT INTO public.features (name, key, module_key, description, has_limit, limit_type, is_visible_in_plan_config)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
    [
      input.name,
      input.key,
      input.moduleKey,
      input.description || "",
      input.hasLimit ?? false,
      input.limitType ?? null,
      input.isVisibleInPlanConfig ?? true,
    ]
  );
  return rowToFeature(result.rows[0]);
}

/** Update an existing feature (key is immutable). */
export async function updateFeature(id: number, input: UpdateFeatureInput): Promise<Feature | null> {
  const p = getPool();
  const before = await p.query<{ is_active: boolean; name: string }>(
    `SELECT is_active, name FROM public.features WHERE id = $1`,
    [id]
  );
  if (before.rowCount === 0) return null;
  const { is_active: wasActive, name: previousName } = before.rows[0];

  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (input.name !== undefined) { sets.push(`name = $${idx++}`); vals.push(input.name); }
  if (input.moduleKey !== undefined) { sets.push(`module_key = $${idx++}`); vals.push(input.moduleKey); }
  if (input.description !== undefined) { sets.push(`description = $${idx++}`); vals.push(input.description); }
  if (input.hasLimit !== undefined) { sets.push(`has_limit = $${idx++}`); vals.push(input.hasLimit); }
  if (input.limitType !== undefined) { sets.push(`limit_type = $${idx++}`); vals.push(input.limitType); }
  if (input.isActive !== undefined) { sets.push(`is_active = $${idx++}`); vals.push(input.isActive); }
  if (input.isVisibleInPlanConfig !== undefined) { sets.push(`is_visible_in_plan_config = $${idx++}`); vals.push(input.isVisibleInPlanConfig); }

  if (sets.length === 0) return null;

  vals.push(id);
  const result = await p.query(
    `UPDATE public.features SET ${sets.join(", ")} WHERE id = $${idx}
     RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
    vals
  );
  if (result.rows.length === 0) return null;
  const row = rowToFeature(result.rows[0]);
  if (wasActive && !row.isActive) {
    await removeFeatureFromAllPricingPlans(id, previousName);
  }
  return row;
}

/** Toggle is_active flag for a feature. */
export async function toggleFeatureActive(id: number): Promise<Feature | null> {
  const p = getPool();
  const cur = await p.query<{ is_active: boolean; name: string }>(
    `SELECT is_active, name FROM public.features WHERE id = $1`,
    [id]
  );
  if (cur.rowCount === 0) return null;
  const { is_active: wasActive, name: previousName } = cur.rows[0];

  const result = await p.query(
    `UPDATE public.features SET is_active = NOT is_active WHERE id = $1
     RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
    [id]
  );
  if (result.rows.length === 0) return null;
  const row = rowToFeature(result.rows[0]);
  if (wasActive && !row.isActive) {
    await removeFeatureFromAllPricingPlans(id, previousName);
  }
  return row;
}
