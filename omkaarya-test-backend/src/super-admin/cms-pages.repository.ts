import { requirePool } from "../db/pool.js";
import type { CmsBundle, CmsPageKey } from "./cms-pages-defaults.js";
import { buildCmsBundle } from "./cms-pages-defaults.js";

const PAGE_KEYS: CmsPageKey[] = ["home", "about", "contact", "settings"];

export class PostgresCmsPagesRepository {
  async fetchAll(): Promise<CmsBundle> {
    const pool = requirePool();
    const { rows } = await pool.query<{ page_key: string; payload: unknown }>(
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

  async upsertPage(pageKey: CmsPageKey, payload: unknown): Promise<void> {
    const pool = requirePool();
    await pool.query(
      `INSERT INTO public.website_cms_pages (page_key, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (page_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [pageKey, JSON.stringify(payload ?? {})]
    );
  }
}
