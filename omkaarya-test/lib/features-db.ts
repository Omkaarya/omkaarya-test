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
  return result.rows.length > 0 ? rowToFeature(result.rows[0]) : null;
}

/** Toggle is_active flag for a feature. */
export async function toggleFeatureActive(id: number): Promise<Feature | null> {
  const p = getPool();
  const result = await p.query(
    `UPDATE public.features SET is_active = NOT is_active WHERE id = $1
     RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
    [id]
  );
  return result.rows.length > 0 ? rowToFeature(result.rows[0]) : null;
}
