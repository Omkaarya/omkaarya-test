/**
 * One-off / ops: seed missing `plan_features` rows from `pricing_plans.features` JSONB
 * in the same Postgres database (tokens match registry `features.name` or `features.key`,
 * trim + case-insensitive). Uses ON CONFLICT DO NOTHING so existing toggles are preserved.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/backfill-plan-features-from-pricing-plans.mjs
 *
 * When plans exist only on Express and not in local `pricing_plans`, open each plan in
 * super-admin feature editor and save once (GET hydration + POST upsert) instead.
 */

const { Pool } = require("pg");

function norm(s) {
  return String(s).trim().toLowerCase();
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  try {
    const { rows: plans } = await pool.query(
      `SELECT id::text AS id, features FROM public.pricing_plans`
    );
    const { rows: feats } = await pool.query(
      `SELECT id::text AS id, name, key FROM public.features WHERE is_active = true`
    );

    const byToken = new Map();
    for (const f of feats) {
      byToken.set(norm(f.name), f.id);
      byToken.set(norm(f.key), f.id);
    }

    let inserted = 0;
    let skippedUnknown = 0;

    for (const plan of plans) {
      const arr = plan.features;
      if (!Array.isArray(arr)) continue;
      const seen = new Set();
      for (const item of arr) {
        if (typeof item !== "string" || !item.trim()) continue;
        const token = norm(item);
        const featureId = byToken.get(token);
        if (!featureId) {
          skippedUnknown++;
          console.warn(`Unknown feature token (no registry match): "${item}" (plan ${plan.id})`);
          continue;
        }
        const dedupe = `${plan.id}:${featureId}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);

        const r = await pool.query(
          `INSERT INTO public.plan_features (plan_id, feature_id, is_enabled, limit_value)
           VALUES ($1, $2, true, NULL)
           ON CONFLICT (plan_id, feature_id) DO NOTHING
           RETURNING feature_id`,
          [plan.id, featureId]
        );
        if (r.rowCount > 0) inserted += r.rowCount;
      }
    }

    console.log(`Done. Inserted ${inserted} new plan_features row(s). Unknown tokens: ${skippedUnknown}.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
