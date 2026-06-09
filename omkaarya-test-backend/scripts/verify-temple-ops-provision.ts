/**
 * Verifies environment variables required for automatic per-temple operational DB
 * provisioning on POST /api/temples/create (see ensureTempleOpsDatabaseMigrated).
 *
 * Usage: npm run verify:temple-ops-env
 * Exit 0 when required vars are set; exit 1 with messages when not (for CI / deploy checks).
 */
import "../src/load-env.js";
import pg from "pg";
import {
  getTempleOpsDiscreteEnvFromProcess,
  hasTempleOpsConnectionBasis,
  poolConfigFromPlatformWithOperationalDatabase,
  resolveTempleOpsPgSuperuserUrl,
} from "../src/db/temple-ops-config.js";

function must(name: string): string | null {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : null;
}

async function tryConnect(url: string, label: string): Promise<void> {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("SELECT 1");
    console.log(`[verify] ${label}: connection OK`);
  } finally {
    await c.end();
  }
}

async function main(): Promise<void> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const discrete = getTempleOpsDiscreteEnvFromProcess();
  const superUrl = resolveTempleOpsPgSuperuserUrl();

  if (!hasTempleOpsConnectionBasis()) {
    errors.push(
      "Temple ops needs a way to connect to each per-temple database: set DATABASE_URL, or DB_HOST and DB_USER (and DB_NAME), or set TEMPLE_OPS_DB_HOST and TEMPLE_OPS_DB_USER."
    );
  }

  if (!superUrl) {
    warnings.push(
      "No CREATE DATABASE URL: set TEMPLE_OPS_PG_SUPERUSER_URL, or on Vercel+Neon ensure DATABASE_URL_UNPOOLED is injected by the Storage integration."
    );
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`[verify] ERROR: ${e}`);
    for (const w of warnings) console.warn(`[verify] WARN: ${w}`);
    process.exit(1);
  }

  for (const w of warnings) console.warn(`[verify] WARN: ${w}`);

  if (superUrl) {
    try {
      await tryConnect(superUrl, "TEMPLE_OPS_PG_SUPERUSER_URL");
    } catch (e) {
      console.error("[verify] ERROR: TEMPLE_OPS_PG_SUPERUSER_URL connection failed:", e);
      process.exit(1);
    }
  }

  const prefix = (process.env.TEMPLE_OPS_DB_NAME_PREFIX ?? "omkaarya_temple_").trim();
  console.log(`[verify] TEMPLE_OPS_DB_NAME_PREFIX effective: ${prefix}`);
  const portLog = discrete?.port ?? "from DATABASE_URL or DB_PORT";
  console.log(`[verify] ops connection port: ${portLog}`);

  const probeDb = must("TEMPLE_OPS_VERIFY_PROBE_DATABASE");
  if (probeDb) {
    const cfg = discrete
      ? {
          host: discrete.host,
          user: discrete.user,
          password: discrete.password,
          port: discrete.port,
          database: probeDb,
        }
      : poolConfigFromPlatformWithOperationalDatabase(probeDb);
    if (!cfg) {
      console.error(
        `[verify] ERROR: could not build connection config for probe database "${probeDb}" (check DATABASE_URL / DB_*).`
      );
      process.exit(1);
    }
    const c = new pg.Client(cfg);
    try {
      await c.connect();
      await c.query("SELECT 1");
      console.log(`[verify] ops host probe (${probeDb}): connection OK`);
    } catch (e) {
      console.error(
        `[verify] ERROR: could not connect to existing database "${probeDb}" on ops host as configured user:`,
        e
      );
      process.exit(1);
    } finally {
      await c.end();
    }
  } else {
    console.log(
      "[verify] Optional: set TEMPLE_OPS_VERIFY_PROBE_DATABASE=postgres (or an existing DB name) to test ops credentials against the host."
    );
  }

  console.log("[verify] Required temple-ops pool env OK. Super-admin temple create can provision new DBs when TEMPLE_OPS_PG_SUPERUSER_URL is set.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
