/**
 * Runs `migrations-temple-ops` against DATABASE_URL pointed at a single temple operational database.
 *
 *   TEMPLE_OPS_DATABASE_URL=postgres://... npm run temple-ops:migrate-env
 *
 * Includes `003_marketing_dashboard_card.sql` (homepage "Temple Dashboard" card). After migrating the
 * demo tenant's ops DB, set `PUBLIC_MARKETING_TEMPLE_OPS_TENANT_ID` on the API server to that `tenant_id`
 * so GET /api/public/why-it-matters-dashboard reads live rows.
 */
import "../src/load-env.js";
import { runPendingTempleOpsMigrations } from "../src/db/run-migrations.js";

async function main(): Promise<void> {
  const url = process.env.TEMPLE_OPS_DATABASE_URL?.trim();
  if (!url) {
    console.error("Set TEMPLE_OPS_DATABASE_URL to the temple operational database connection string.");
    process.exit(1);
  }
  const { applied, skipped } = await runPendingTempleOpsMigrations({ connectionString: url });
  console.log(`[temple-ops:migrate-env] applied: ${applied.length}, skipped: ${skipped.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
