import type { Pool } from "pg";

export type PrasadCategoryRow = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type PrasadItemRow = {
  id: string;
  category_id: string | null;
  category_name: string | null;
  name: string;
  sku: string | null;
  price_amount: string;
  currency: string;
  included_items: unknown;
  status: string;
  emoji: string | null;
  sort_order: number;
  updated_at: string;
};

export async function listPrasadCategories(pool: Pool): Promise<PrasadCategoryRow[]> {
  const { rows } = await pool.query<PrasadCategoryRow>(
    `SELECT id::text, name, description, sort_order, is_active
     FROM prasad_categories
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
  );
  return rows;
}

export async function insertPrasadCategory(
  pool: Pool,
  input: { name: string; description: string | null; sortOrder?: number }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO prasad_categories (name, description, sort_order)
     VALUES ($1, $2, $3)
     RETURNING id::text AS id`,
    [input.name, input.description, input.sortOrder ?? 0]
  );
  return rows[0]!;
}

export async function listPrasadItems(pool: Pool, search?: string): Promise<PrasadItemRow[]> {
  const q = (search ?? "").trim();
  const params: unknown[] = [];
  let where = "WHERE p.deleted_at IS NULL";
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where += ` AND (LOWER(p.name) LIKE $1 OR LOWER(COALESCE(p.sku, '')) LIKE $1)`;
  }
  const { rows } = await pool.query<PrasadItemRow>(
    `SELECT p.id::text AS id, p.category_id::text, c.name AS category_name,
            p.name, p.sku, p.price_amount::text, p.currency,
            p.included_items, p.status, p.emoji, p.sort_order,
            p.updated_at::text AS updated_at
     FROM prasad_items p
     LEFT JOIN prasad_categories c ON c.id = p.category_id AND c.deleted_at IS NULL
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );
  return rows;
}

export async function insertPrasadItem(
  pool: Pool,
  input: {
    name: string;
    sku: string | null;
    categoryId: string | null;
    priceAmount: number;
    currency: string;
    includedItems: string[];
    status: string;
    emoji: string | null;
  }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO prasad_items (
       category_id, name, sku, price_amount, currency, included_items, status, emoji
     ) VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, $7, $8)
     RETURNING id::text AS id`,
    [
      input.categoryId,
      input.name,
      input.sku,
      input.priceAmount,
      input.currency,
      JSON.stringify(input.includedItems),
      input.status,
      input.emoji,
    ]
  );
  return rows[0]!;
}

export async function softDeletePrasadItem(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE prasad_items SET deleted_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

export type FinanceAssetRow = {
  id: string;
  asset_type: string;
  name: string;
  code: string | null;
  value_amount: string | null;
  currency: string;
  weight_or_area: string | null;
  acquired_date: string | null;
  status: string | null;
  notes: string | null;
};

export async function listFinanceAssets(pool: Pool, assetType?: string): Promise<FinanceAssetRow[]> {
  const params: unknown[] = [];
  let where = "WHERE deleted_at IS NULL";
  if (assetType?.trim()) {
    params.push(assetType.trim());
    where += ` AND asset_type = $1`;
  }
  const { rows } = await pool.query<FinanceAssetRow>(
    `SELECT id::text, asset_type, name, code, value_amount::text, currency,
            weight_or_area, acquired_date::text, status, notes
     FROM finance_assets ${where}
     ORDER BY created_at DESC`,
    params
  );
  return rows;
}

export async function insertFinanceAsset(
  pool: Pool,
  input: {
    assetType: string;
    name: string;
    code: string | null;
    valueAmount: number | null;
    currency: string;
    weightOrArea: string | null;
    acquiredDate: string | null;
    status: string | null;
    notes: string | null;
  }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO finance_assets (
       asset_type, name, code, value_amount, currency, weight_or_area, acquired_date, status, notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9)
     RETURNING id::text AS id`,
    [
      input.assetType,
      input.name,
      input.code,
      input.valueAmount,
      input.currency,
      input.weightOrArea,
      input.acquiredDate,
      input.status,
      input.notes,
    ]
  );
  return rows[0]!;
}

export async function softDeleteFinanceAsset(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE finance_assets SET deleted_at = NOW() WHERE id = $1::uuid AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

export type PublicSitePageRow = {
  page_key: string;
  title: string | null;
  content: Record<string, unknown>;
  updated_at: string;
};

export async function getPublicSitePage(pool: Pool, pageKey: string): Promise<PublicSitePageRow | null> {
  const { rows } = await pool.query<PublicSitePageRow>(
    `SELECT page_key, title, content, updated_at::text AS updated_at
     FROM public_site_pages WHERE page_key = $1`,
    [pageKey]
  );
  return rows[0] ?? null;
}

export async function upsertPublicSitePage(
  pool: Pool,
  input: { pageKey: string; title: string | null; content: Record<string, unknown> }
): Promise<void> {
  await pool.query(
    `INSERT INTO public_site_pages (page_key, title, content, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (page_key) DO UPDATE SET
       title = EXCLUDED.title,
       content = EXCLUDED.content,
       updated_at = NOW()`,
    [input.pageKey, input.title, JSON.stringify(input.content)]
  );
}

export async function listPublicSitePages(pool: Pool): Promise<PublicSitePageRow[]> {
  const { rows } = await pool.query<PublicSitePageRow>(
    `SELECT page_key, title, content, updated_at::text AS updated_at
     FROM public_site_pages ORDER BY created_at DESC`
  );
  return rows;
}
