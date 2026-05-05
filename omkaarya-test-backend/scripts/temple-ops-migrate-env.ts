/**
 * Runs `migrations-temple-ops` against DATABASE_URL pointed at a single temple operational database.
 *
 *   TEMPLE_OPS_DATABASE_URL=postgres://... npm run temple-ops:migrate-env
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
