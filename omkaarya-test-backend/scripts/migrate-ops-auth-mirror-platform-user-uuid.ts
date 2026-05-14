/**
 * After platform migration `029_uuid_tenants_users_superadmin.sql`, each temple operational DB may still
 * have `temple_auth_mirror.platform_user_id` as INTEGER. This CLI runs the same logic as Vercel cold start.
 *
 * Run: `npm run migrate:ops-auth-mirror-user-ids` (requires DATABASE_URL / DB_* and TEMPLE_OPS_* for ops pools).
 */
import "../src/load-env.js";
import { requirePool } from "../src/db/pool.js";
import { runOpsAuthMirrorUserIdMigration } from "../src/db/run-ops-auth-mirror-migration.js";

async function main(): Promise<void> {
  requirePool();
  const r = await runOpsAuthMirrorUserIdMigration();
  if (!r.ok && r.reason === "NO_MAP_TABLE") {
    console.error(
      "[migrate:ops-auth-mirror] uuid_migration_user_map is missing. Apply platform migration 029 on the platform DB first."
    );
    process.exit(1);
  }
  if (!r.ok && r.reason === "EMPTY_MAP") {
    console.error(
      "[migrate:ops-auth-mirror] uuid_migration_user_map is empty. Apply platform migration 029 on the platform DB first."
    );
    process.exit(1);
  }
  if (!r.ok && r.reason === "NO_PLATFORM_POOL") {
    console.error("[migrate:ops-auth-mirror] Platform database is not configured.");
    process.exit(1);
  }
  console.log("[migrate:ops-auth-mirror] done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
