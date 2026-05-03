import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { sendSuccess } from "../middleware/api-envelope.js";
import { HttpError } from "../middleware/http-error.js";
import { requirePool } from "../db/pool.js";
import type { PostgresPricingPlansRepository } from "../super-admin/pricing-plans.repository.js";

function asInt(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export type PublicOverviewResponse = {
  totalTemples: number;
  totalDevotees: number;
  countriesServed: number;
  activeCount: number;
  trialCount: number;
  latestTempleCreatedAt: string | null;
};

export type PublicTempleListItem = {
  name: string;
  city: string;
  countryCode: string;
  countryFlag: string;
  plan: string;
  status: string;
};

export type PublicTestimonialsItem = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  templeName: string;
  countryCode: string;
  countryFlag: string;
  rating: number;
};

export function createPublicRouter(pricingPlans: PostgresPricingPlansRepository): Router {
  const r = Router();

  r.get(
    "/public/overview",
    asyncHandler(async (_req, res) => {
      const pool = requirePool();
      const [{ rows: aggRows }, { rows: latestRows }] = await Promise.all([
        pool.query<{
          total: number;
          devotees: number;
          countries: number;
          active_count: number;
          trial_count: number;
        }>(
          `SELECT
             COUNT(*)::int AS total,
             COALESCE(SUM(devotees), 0)::int AS devotees,
             COUNT(DISTINCT NULLIF(TRIM(country_code), ''))::int AS countries,
             COUNT(*) FILTER (WHERE status = 'Active')::int AS active_count,
             COUNT(*) FILTER (WHERE status = 'Trial')::int AS trial_count
           FROM public.temples`
        ),
        pool.query<{ created_at: string | null }>(
          `SELECT (MAX(created_at))::timestamptz::text AS created_at FROM public.temples`
        ),
      ]);

      const row = aggRows[0];
      const data: PublicOverviewResponse = {
        totalTemples: row?.total ?? 0,
        totalDevotees: row?.devotees ?? 0,
        countriesServed: row?.countries ?? 0,
        activeCount: row?.active_count ?? 0,
        trialCount: row?.trial_count ?? 0,
        latestTempleCreatedAt: latestRows[0]?.created_at ?? null,
      };

      sendSuccess(res, 200, data, "Public overview loaded", "Aggregated, non-sensitive platform metrics for the marketing site.");
    })
  );

  r.get(
    "/public/temples",
    asyncHandler(async (req, res) => {
      const pool = requirePool();
      const limitRaw = asInt(req.query.limit);
      const offsetRaw = asInt(req.query.offset);
      const limit = Math.min(Math.max(limitRaw ?? 12, 1), 50);
      const offset = Math.max(offsetRaw ?? 0, 0);

      const { rows } = await pool.query<{
        name: string;
        city: string | null;
        country_code: string;
        country_flag: string | null;
        plan: string | null;
        status: string | null;
      }>(
        `SELECT name,
                COALESCE(NULLIF(TRIM(city), ''), '—') AS city,
                COALESCE(NULLIF(TRIM(country_code), ''), '—') AS country_code,
                COALESCE(country_flag, '') AS country_flag,
                COALESCE(NULLIF(TRIM(plan), ''), '—') AS plan,
                COALESCE(NULLIF(TRIM(status), ''), '—') AS status
         FROM public.temples
         ORDER BY created_at DESC, tenant_id::int DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const data: PublicTempleListItem[] = rows.map((t) => ({
        name: t.name,
        city: t.city ?? "—",
        countryCode: t.country_code,
        countryFlag: t.country_flag ?? "",
        plan: t.plan ?? "—",
        status: t.status ?? "—",
      }));

      sendSuccess(res, 200, { data, limit, offset }, "Public temples loaded", "A sanitized list of temples for marketing display.");
    })
  );

  r.get(
    "/public/pricing",
    asyncHandler(async (_req, res) => {
      const [plans, comparison] = await Promise.all([
        pricingPlans.getAll(),
        pricingPlans.getComparison(),
      ]);
      sendSuccess(
        res,
        200,
        { plans, comparison },
        "Public pricing loaded",
        "Pricing plan catalog and plan feature matrix for the public pricing page."
      );
    })
  );

  r.get(
    "/public/testimonials",
    asyncHandler(async (_req, res) => {
      const pool = requirePool();
      const { rows } = await pool.query<{
        id: string;
        quote: string;
        author_name: string;
        author_role: string;
        temple_name: string;
        country_code: string;
        country_flag: string;
        rating: number;
      }>(
        `SELECT id::text AS id,
                quote,
                author_name,
                author_role,
                temple_name,
                country_code,
                country_flag,
                rating
         FROM public.testimonials
         WHERE is_published = true
         ORDER BY sort_order ASC, created_at DESC`
      );

      const data: PublicTestimonialsItem[] = rows.map((r) => ({
        id: r.id,
        quote: r.quote,
        authorName: r.author_name,
        authorRole: r.author_role,
        templeName: r.temple_name,
        countryCode: r.country_code,
        countryFlag: r.country_flag,
        rating: r.rating,
      }));

      sendSuccess(res, 200, data, "Public testimonials loaded", "Published testimonials for marketing pages.");
    })
  );

  r.use((_req, _res, next) => {
    next(
      new HttpError(404, "Not found", {
        code: "NOT_FOUND",
        reason: "No public route matches this method and path.",
      })
    );
  });

  return r;
}

