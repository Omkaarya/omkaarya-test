import { requirePool } from "../db/pool.js";

export type LimitType = "number" | "boolean" | null;

export type FeatureDto = {
  id: string;
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

export type PlanFeatureDto = {
  id: string;
  planId: string;
  featureId: string;
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
  featureId: string;
  isEnabled: boolean;
  limitValue?: number | null;
};

function rowToFeature(r: {
  id: string;
  name: string;
  key: string;
  module_key: string;
  description: string;
  has_limit: boolean;
  limit_type: string | null;
  is_active: boolean;
  is_visible_in_plan_config: boolean;
  created_at: string;
}): FeatureDto {
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

export class PostgresFeatureRegistryRepository {
  async removeFeatureFromAllPricingPlans(featureId: string, nameToRemoveFromJson: string): Promise<void> {
    const pool = requirePool();
    await pool.query(`DELETE FROM public.plan_features WHERE feature_id = $1`, [featureId]);
    const { rows } = await pool.query<{ id: string; features: unknown }>(
      `SELECT id, features FROM public.pricing_plans`
    );
    for (const row of rows) {
      const arr = row.features;
      if (!Array.isArray(arr)) continue;
      const strs = arr.filter((x): x is string => typeof x === "string");
      if (!strs.includes(nameToRemoveFromJson)) continue;
      const next = strs.filter((n) => n !== nameToRemoveFromJson);
      await pool.query(
        `UPDATE public.pricing_plans SET features = $1::jsonb, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(next), row.id]
      );
    }
  }

  async fetchAllFeatures(): Promise<FeatureDto[]> {
    const pool = requirePool();
    const result = await pool.query(
      `SELECT id, name, key, module_key, description, has_limit, limit_type,
              is_active, is_visible_in_plan_config, created_at
       FROM public.features
       ORDER BY module_key, name`
    );
    return result.rows.map(rowToFeature);
  }

  async fetchAllActiveFeaturesOrdered(): Promise<FeatureDto[]> {
    const rows = await this.fetchAllFeatures();
    return rows.filter((f) => f.isActive).sort((a, b) => {
      const mk = a.moduleKey.localeCompare(b.moduleKey);
      if (mk !== 0) return mk;
      return a.name.localeCompare(b.name);
    });
  }

  async fetchPlanFeatures(planId: string): Promise<PlanFeatureDto[]> {
    const pool = requirePool();
    const result = await pool.query(
      `SELECT pf.id, pf.plan_id, pf.feature_id, f.name AS feature_name, f.key AS feature_key,
              f.module_key, f.has_limit, pf.is_enabled, pf.limit_value, pf.created_at
       FROM public.plan_features pf
       JOIN public.features f ON f.id = pf.feature_id
       WHERE pf.plan_id = $1
       ORDER BY f.module_key, f.name`,
      [planId]
    );
    return result.rows.map(
      (r: {
        id: string;
        plan_id: string;
        feature_id: string;
        feature_name: string;
        feature_key: string;
        module_key: string;
        has_limit: boolean;
        is_enabled: boolean;
        limit_value: number | null;
        created_at: string;
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
      })
    );
  }

  async upsertPlanFeatures(items: PlanFeatureUpsert[]): Promise<void> {
    if (items.length === 0) return;
    const pool = requirePool();
    const client = await pool.connect();
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

  async insertFeature(input: CreateFeatureInput): Promise<FeatureDto> {
    const pool = requirePool();
    const result = await pool.query(
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

  async updateFeature(id: string, input: UpdateFeatureInput): Promise<FeatureDto | null> {
    const pool = requirePool();
    const before = await pool.query<{ is_active: boolean; name: string }>(
      `SELECT is_active, name FROM public.features WHERE id = $1`,
      [id]
    );
    if (before.rowCount === 0) return null;
    const { is_active: wasActive, name: previousName } = before.rows[0];

    const sets: string[] = [];
    const vals: unknown[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      sets.push(`name = $${idx++}`);
      vals.push(input.name);
    }
    if (input.moduleKey !== undefined) {
      sets.push(`module_key = $${idx++}`);
      vals.push(input.moduleKey);
    }
    if (input.description !== undefined) {
      sets.push(`description = $${idx++}`);
      vals.push(input.description);
    }
    if (input.hasLimit !== undefined) {
      sets.push(`has_limit = $${idx++}`);
      vals.push(input.hasLimit);
    }
    if (input.limitType !== undefined) {
      sets.push(`limit_type = $${idx++}`);
      vals.push(input.limitType);
    }
    if (input.isActive !== undefined) {
      sets.push(`is_active = $${idx++}`);
      vals.push(input.isActive);
    }
    if (input.isVisibleInPlanConfig !== undefined) {
      sets.push(`is_visible_in_plan_config = $${idx++}`);
      vals.push(input.isVisibleInPlanConfig);
    }

    if (sets.length === 0) return null;

    vals.push(id);
    const result = await pool.query(
      `UPDATE public.features SET ${sets.join(", ")} WHERE id = $${idx}
       RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
      vals
    );
    if (result.rows.length === 0) return null;
    const row = rowToFeature(result.rows[0]);
    if (wasActive && !row.isActive) {
      await this.removeFeatureFromAllPricingPlans(id, previousName);
    }
    return row;
  }

  async toggleFeatureActive(id: string): Promise<FeatureDto | null> {
    const pool = requirePool();
    const cur = await pool.query<{ is_active: boolean; name: string }>(
      `SELECT is_active, name FROM public.features WHERE id = $1`,
      [id]
    );
    if (cur.rowCount === 0) return null;
    const { is_active: wasActive, name: previousName } = cur.rows[0];

    const result = await pool.query(
      `UPDATE public.features SET is_active = NOT is_active WHERE id = $1
       RETURNING id, name, key, module_key, description, has_limit, limit_type, is_active, is_visible_in_plan_config, created_at`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = rowToFeature(result.rows[0]);
    if (wasActive && !row.isActive) {
      await this.removeFeatureFromAllPricingPlans(id, previousName);
    }
    return row;
  }
}
