import type { Pool } from "pg";

export const SETTINGS_AREAS = [
  "general",
  "web",
  "org_tree",
  "system_email",
  "system_finance",
  "system_inventory",
  "app_invoice",
  "app_pos",
  "app_printers",
  "public_branding",
  "public_seo",
  "public_features",
] as const;

export type SettingsArea = (typeof SETTINGS_AREAS)[number];

export type SettingsAreaRow = {
  area_key: string;
  payload: Record<string, unknown>;
  updated_at: string;
};

export function isSettingsArea(v: string): v is SettingsArea {
  return (SETTINGS_AREAS as readonly string[]).includes(v);
}

/** Fields that contain secrets and must be masked when returned to clients. */
const SECRET_FIELD_KEYS: Record<SettingsArea, string[]> = {
  general: [],
  web: [],
  org_tree: [],
  system_email: ["smtpPassword", "sendgridApiKey", "password", "apiKey"],
  system_finance: [],
  system_inventory: [],
  app_invoice: [],
  app_pos: [],
  app_printers: [],
  public_branding: [],
  public_seo: [],
  public_features: [],
};

export function maskSettingsPayload(area: SettingsArea, payload: Record<string, unknown>): Record<string, unknown> {
  const secretKeys = SECRET_FIELD_KEYS[area] ?? [];
  if (secretKeys.length === 0) return payload;
  const out: Record<string, unknown> = { ...payload };
  for (const key of secretKeys) {
    if (typeof out[key] === "string" && (out[key] as string).length > 0) {
      out[key] = "********";
    }
  }
  return out;
}

export async function getSettingsArea(pool: Pool, area: SettingsArea): Promise<SettingsAreaRow | null> {
  const { rows } = await pool.query<{ area_key: string; payload: unknown; updated_at: string }>(
    `SELECT area_key, payload, updated_at::text AS updated_at
       FROM temple_settings_areas WHERE area_key = $1 LIMIT 1`,
    [area]
  );
  const r = rows[0];
  if (!r) return null;
  const payload =
    typeof r.payload === "object" && r.payload !== null ? (r.payload as Record<string, unknown>) : {};
  return { area_key: r.area_key, payload, updated_at: r.updated_at };
}

export async function getAllSettings(pool: Pool): Promise<Record<string, Record<string, unknown>>> {
  const { rows } = await pool.query<{ area_key: string; payload: unknown }>(
    `SELECT area_key, payload FROM temple_settings_areas`
  );
  const out: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    const p = typeof r.payload === "object" && r.payload !== null ? (r.payload as Record<string, unknown>) : {};
    out[r.area_key] = p;
  }
  return out;
}

/**
 * Patches the given settings area by merging incoming payload at the top level.
 * Secret fields preserve their existing value when the incoming value is "********" or empty.
 */
export async function patchSettingsArea(
  pool: Pool,
  area: SettingsArea,
  patch: Record<string, unknown>
): Promise<SettingsAreaRow> {
  const current = (await getSettingsArea(pool, area))?.payload ?? {};
  const secretKeys = SECRET_FIELD_KEYS[area] ?? [];

  const merged: Record<string, unknown> = { ...current };
  for (const [k, v] of Object.entries(patch)) {
    if (secretKeys.includes(k)) {
      if (typeof v === "string" && (v.trim() === "" || v === "********")) {
        continue;
      }
    }
    merged[k] = v;
  }

  const { rows } = await pool.query<{ area_key: string; payload: unknown; updated_at: string }>(
    `INSERT INTO temple_settings_areas (area_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (area_key) DO UPDATE
       SET payload = EXCLUDED.payload,
           updated_at = NOW()
     RETURNING area_key, payload, updated_at::text AS updated_at`,
    [area, JSON.stringify(merged)]
  );
  const r = rows[0]!;
  const payload = typeof r.payload === "object" && r.payload !== null ? (r.payload as Record<string, unknown>) : {};
  return { area_key: r.area_key, payload, updated_at: r.updated_at };
}

/** Replaces the area payload entirely (e.g. for org_tree where partial merge doesn't apply). */
export async function replaceSettingsArea(
  pool: Pool,
  area: SettingsArea,
  payload: Record<string, unknown>
): Promise<SettingsAreaRow> {
  const { rows } = await pool.query<{ area_key: string; payload: unknown; updated_at: string }>(
    `INSERT INTO temple_settings_areas (area_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (area_key) DO UPDATE
       SET payload = EXCLUDED.payload,
           updated_at = NOW()
     RETURNING area_key, payload, updated_at::text AS updated_at`,
    [area, JSON.stringify(payload)]
  );
  const r = rows[0]!;
  const out = typeof r.payload === "object" && r.payload !== null ? (r.payload as Record<string, unknown>) : {};
  return { area_key: r.area_key, payload: out, updated_at: r.updated_at };
}
