import "../src/load-env.js";
import { runPendingMigrations } from "../src/db/run-migrations.js";

async function main() {
  const { applied, skipped } = await runPendingMigrations();
  for (const f of skipped) {
    console.log(`[migrate] skip ${f} (already applied)`);
  }
  if (applied.length === 0 && skipped.length === 0) {
    console.log("[migrate] No migration files to run.");
  } else {
    console.log(`[migrate] Done. Applied: ${applied.length}, skipped: ${skipped.length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
