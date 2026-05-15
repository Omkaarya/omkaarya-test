import type { PoolClient } from "pg";
import { getPool, requirePool } from "../db/pool.js";

export type MasterDeityRow = {
  id: string;
  slug: string;
  displaySerial: number;
  displayCode: string;
  name: string;
  secondaryLabel: string | null;
  isActive: boolean;
  countryCode: string | null;
  placeholderHue: string | null;
  imageDataUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MasterDeityListResponse = {
  data: MasterDeityRow[];
  total: number;
  totalAll: number;
  totalPages: number;
  countries: string[];
};

export type MasterDeityCatalogEntry = {
  id: string;
  name: string;
  secondaryLabel?: string;
  placeholderHue: string;
  imageDataUrl?: string | null;
};

function displayCodeFromSerial(n: number): string {
  return `D${String(n).padStart(3, "0")}`;
}

function mapRow(r: {
  id: string;
  slug: string;
  display_serial: number;
  name: string;
  secondary_label: string | null;
  is_active: boolean;
  country_code: string | null;
  placeholder_hue: string | null;
  image_data_url: string | null;
  created_at: string;
  updated_at: string;
}): MasterDeityRow {
  return {
    id: r.id,
    slug: r.slug,
    displaySerial: r.display_serial,
    displayCode: displayCodeFromSerial(r.display_serial),
    name: r.name,
    secondaryLabel: r.secondary_label,
    isActive: r.is_active,
    countryCode: r.country_code,
    placeholderHue: r.placeholder_hue,
    imageDataUrl: r.image_data_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function slugifyBase(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s.length > 0 ? s : "deity";
}

export class PostgresMasterDeitiesRepository {
  async listActiveCatalogEntries(): Promise<MasterDeityCatalogEntry[]> {
    const pool = getPool();
    if (!pool) return [];

    const { rows } = await pool.query<{
      slug: string;
      name: string;
      secondary_label: string | null;
      placeholder_hue: string | null;
      image_data_url: string | null;
    }>(
      `SELECT slug, name, secondary_label, placeholder_hue, image_data_url
       FROM public.master_deities
       WHERE is_active = true
       ORDER BY display_serial ASC, name ASC`
    );

    return rows.map((r) => ({
      id: r.slug,
      name: r.name,
      ...(r.secondary_label ? { secondaryLabel: r.secondary_label } : {}),
      placeholderHue: (r.placeholder_hue ?? "from-zinc-400 to-zinc-600").trim() || "from-zinc-400 to-zinc-600",
      imageDataUrl: r.image_data_url,
    }));
  }

  /**
   * Returns true when every slug exists and is active (for onboarding POST validation).
   */
  async assertAllSlugsActiveAndExist(slugs: string[]): Promise<{ ok: true } | { ok: false; invalid: string[] }> {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
    if (unique.length === 0) return { ok: false, invalid: slugs };

    const pool = getPool();
    if (!pool) {
      return { ok: false, invalid: unique };
    }

    const { rows } = await pool.query<{ slug: string }>(
      `SELECT slug FROM public.master_deities
       WHERE slug = ANY($1::text[]) AND is_active = true`,
      [unique]
    );
    const found = new Set(rows.map((r) => r.slug));
    const invalid = unique.filter((s) => !found.has(s));
    if (invalid.length > 0) return { ok: false, invalid };
    return { ok: true };
  }

  async listCountries(): Promise<string[]> {
    const pool = getPool();
    if (!pool) return [];

    const { rows } = await pool.query<{ c: string }>(
      `SELECT DISTINCT TRIM(country_code) AS c
       FROM public.master_deities
       WHERE country_code IS NOT NULL AND TRIM(country_code) <> ''
       ORDER BY 1 ASC`
    );
    return rows.map((r) => r.c).filter(Boolean);
  }

  async listPaged(input: {
    q: string;
    status: "all" | "active" | "inactive";
    country: string;
    sortBy: "name" | "last7";
    page: number;
    pageSize: number;
  }): Promise<MasterDeityListResponse> {
    const pool = getPool();
    if (!pool) {
      return { data: [], total: 0, totalAll: 0, totalPages: 1, countries: [] };
    }

    const page = Math.max(1, input.page);
    const pageSize = Math.min(100, Math.max(1, input.pageSize));
    const offset = (page - 1) * pageSize;
    const q = input.q.trim().toLowerCase();

    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (q.length > 0) {
      conditions.push(
        `(LOWER(name) LIKE $${i} OR LOWER(COALESCE(secondary_label, '')) LIKE $${i} OR LOWER(slug) LIKE $${i})`
      );
      params.push(`%${q}%`);
      i += 1;
    }

    if (input.status === "active") {
      conditions.push(`is_active = true`);
    } else if (input.status === "inactive") {
      conditions.push(`is_active = false`);
    }

    if (input.country !== "all" && input.country.trim() !== "") {
      conditions.push(`country_code = $${i}`);
      params.push(input.country.trim());
      i += 1;
    }

    if (input.sortBy === "last7") {
      conditions.push(`created_at >= NOW() - INTERVAL '7 days'`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countAllRes = await pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM public.master_deities`);
    const totalAll = Number(countAllRes.rows[0]?.c ?? 0);

    const countRes = await pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.master_deities ${whereSql}`,
      params
    );
    const total = Number(countRes.rows[0]?.c ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const orderSql =
      input.sortBy === "last7"
        ? `ORDER BY created_at DESC, display_serial ASC`
        : `ORDER BY name ASC NULLS LAST, display_serial ASC`;

    const listParams = [...params, pageSize, offset];
    const limitIdx = i;
    const offsetIdx = i + 1;

    const { rows } = await pool.query<{
      id: string;
      slug: string;
      display_serial: number;
      name: string;
      secondary_label: string | null;
      is_active: boolean;
      country_code: string | null;
      placeholder_hue: string | null;
      image_data_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, slug, display_serial, name, secondary_label, is_active, country_code,
              placeholder_hue, image_data_url, created_at::text, updated_at::text
       FROM public.master_deities
       ${whereSql}
       ${orderSql}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      listParams
    );

    const countries = await this.listCountries();

    return {
      data: rows.map(mapRow),
      total,
      totalAll,
      totalPages,
      countries,
    };
  }

  async getById(id: string): Promise<MasterDeityRow | null> {
    const pool = getPool();
    if (!pool) return null;

    const { rows } = await pool.query<{
      id: string;
      slug: string;
      display_serial: number;
      name: string;
      secondary_label: string | null;
      is_active: boolean;
      country_code: string | null;
      placeholder_hue: string | null;
      image_data_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, slug, display_serial, name, secondary_label, is_active, country_code,
              placeholder_hue, image_data_url, created_at::text, updated_at::text
       FROM public.master_deities WHERE id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async nextDisplaySerial(client: Pick<PoolClient, "query">): Promise<number> {
    const { rows } = await client.query<{ m: string }>(
      `SELECT COALESCE(MAX(display_serial), 0) + 1::text AS m FROM public.master_deities`
    );
    return Number(rows[0]?.m ?? 1);
  }

  async slugExists(client: Pick<PoolClient, "query">, slug: string): Promise<boolean> {
    const { rows } = await client.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.master_deities WHERE slug = $1`,
      [slug]
    );
    return Number(rows[0]?.c ?? 0) > 0;
  }

  async create(input: {
    name: string;
    secondaryLabel?: string | null;
    isActive: boolean;
    countryCode?: string | null;
    placeholderHue?: string | null;
    imageDataUrl?: string | null;
    slug?: string | null;
  }): Promise<MasterDeityRow> {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const displaySerial = await this.nextDisplaySerial(client);

      let slug: string;
      if (input.slug?.trim()) {
        slug = input.slug.trim();
        if (await this.slugExists(client, slug)) {
          await client.query("ROLLBACK");
          throw new Error("SLUG_CONFLICT");
        }
      } else {
        const base = slugifyBase(input.name);
        let candidate = base;
        let n = 2;
        while (await this.slugExists(client, candidate)) {
          const suffix = `-${n}`;
          candidate = `${base.slice(0, Math.max(1, 60 - suffix.length))}${suffix}`;
          n += 1;
        }
        slug = candidate;
      }

      const { rows } = await client.query<{
        id: string;
        slug: string;
        display_serial: number;
        name: string;
        secondary_label: string | null;
        is_active: boolean;
        country_code: string | null;
        placeholder_hue: string | null;
        image_data_url: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `INSERT INTO public.master_deities
          (slug, display_serial, name, secondary_label, is_active, country_code, placeholder_hue, image_data_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, slug, display_serial, name, secondary_label, is_active, country_code,
                   placeholder_hue, image_data_url, created_at::text, updated_at::text`,
        [
          slug,
          displaySerial,
          input.name.trim(),
          input.secondaryLabel?.trim() ? input.secondaryLabel.trim() : null,
          input.isActive,
          input.countryCode?.trim() ? input.countryCode.trim().toUpperCase() : null,
          input.placeholderHue?.trim() || "from-zinc-400 to-zinc-600",
          input.imageDataUrl?.trim() ? input.imageDataUrl.trim() : null,
        ]
      );
      await client.query("COMMIT");
      return mapRow(rows[0]!);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    patch: {
      name?: string;
      secondaryLabel?: string | null;
      isActive?: boolean;
      countryCode?: string | null;
      placeholderHue?: string | null;
      imageDataUrl?: string | null;
    }
  ): Promise<MasterDeityRow | null> {
    const pool = getPool();
    if (!pool) return null;

    const existing = await this.getById(id);
    if (!existing) return null;

    const name = patch.name !== undefined ? patch.name.trim() : existing.name;
    const secondaryLabel =
      patch.secondaryLabel !== undefined
        ? patch.secondaryLabel === null || patch.secondaryLabel.trim() === ""
          ? null
          : patch.secondaryLabel.trim()
        : existing.secondaryLabel;
    const isActive = patch.isActive !== undefined ? patch.isActive : existing.isActive;
    const countryCode =
      patch.countryCode !== undefined
        ? patch.countryCode === null || String(patch.countryCode).trim() === ""
          ? null
          : String(patch.countryCode).trim().toUpperCase()
        : existing.countryCode;
    const placeholderHue =
      patch.placeholderHue !== undefined
        ? (patch.placeholderHue?.trim() || "from-zinc-400 to-zinc-600")
        : existing.placeholderHue ?? "from-zinc-400 to-zinc-600";
    const imageDataUrl =
      patch.imageDataUrl !== undefined
        ? patch.imageDataUrl === null || String(patch.imageDataUrl).trim() === ""
          ? null
          : String(patch.imageDataUrl).trim()
        : existing.imageDataUrl;

    const { rows } = await pool.query<{
      id: string;
      slug: string;
      display_serial: number;
      name: string;
      secondary_label: string | null;
      is_active: boolean;
      country_code: string | null;
      placeholder_hue: string | null;
      image_data_url: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `UPDATE public.master_deities
       SET name = $2,
           secondary_label = $3,
           is_active = $4,
           country_code = $5,
           placeholder_hue = $6,
           image_data_url = $7,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, slug, display_serial, name, secondary_label, is_active, country_code,
                 placeholder_hue, image_data_url, created_at::text, updated_at::text`,
      [id, name, secondaryLabel, isActive, countryCode, placeholderHue, imageDataUrl]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async softDeactivate(id: string): Promise<MasterDeityRow | null> {
    return this.update(id, { isActive: false });
  }
}
