/**
 * Website CMS snippets — `website_cms_pages` (Postgres).
 */

import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";
import {
  type CmsBundle,
  type CmsPageKey,
  buildCmsBundle,
} from "@/lib/website-cms-defaults";

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

const PAGE_KEYS: CmsPageKey[] = ["home", "about", "contact", "settings"];

export async function fetchAllCmsPages(): Promise<CmsBundle> {
  const p = getPool();
  const { rows } = await p.query<{ page_key: string; payload: unknown }>(
    `SELECT page_key, payload FROM public.website_cms_pages WHERE page_key = ANY($1::text[])`,
    [PAGE_KEYS]
  );
  const map: Partial<Record<CmsPageKey, unknown>> = {};
  for (const r of rows) {
    if (PAGE_KEYS.includes(r.page_key as CmsPageKey)) {
      map[r.page_key as CmsPageKey] = r.payload;
    }
  }
  return buildCmsBundle({
    home: map.home,
    about: map.about,
    contact: map.contact,
    settings: map.settings,
  });
}

export async function upsertCmsPage(pageKey: CmsPageKey, payload: unknown): Promise<void> {
  const p = getPool();
  await p.query(
    `INSERT INTO public.website_cms_pages (page_key, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (page_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [pageKey, JSON.stringify(payload ?? {})]
  );
}
