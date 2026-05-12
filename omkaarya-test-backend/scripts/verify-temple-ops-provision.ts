/**
 * Verifies environment variables required for automatic per-temple operational DB
 * provisioning on POST /api/temples/create (see ensureTempleOpsDatabaseMigrated).
 *
 * Usage: npm run verify:temple-ops-env
 * Exit 0 when required vars are set; exit 1 with messages when not (for CI / deploy checks).
 */
import "../src/load-env.js";
import pg from "pg";

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

  const host = must("TEMPLE_OPS_DB_HOST");
  const user = must("TEMPLE_OPS_DB_USER");
  const superUrl = must("TEMPLE_OPS_PG_SUPERUSER_URL");

  if (!host) errors.push("TEMPLE_OPS_DB_HOST is required for temple ops pools after CREATE DATABASE.");
  if (!user) errors.push("TEMPLE_OPS_DB_USER is required for temple ops pools.");

  if (!superUrl) {
    warnings.push(
      "TEMPLE_OPS_PG_SUPERUSER_URL is unset: POST /api/temples/create will not run CREATE DATABASE automatically " +
        "(each ops DB must already exist, or set superuser URL to maintenance DB postgres)."
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

  const port = must("TEMPLE_OPS_DB_PORT") ?? "5432";
  const pass = process.env.TEMPLE_OPS_DB_PASS ?? "";
  const prefix = (process.env.TEMPLE_OPS_DB_NAME_PREFIX ?? "omkaarya_temple_").trim();
  console.log(`[verify] TEMPLE_OPS_DB_NAME_PREFIX effective: ${prefix}`);
  console.log(`[verify] TEMPLE_OPS_DB_PORT: ${port}`);

  const probeDb = must("TEMPLE_OPS_VERIFY_PROBE_DATABASE");
  if (probeDb) {
    const portNum = Number.parseInt(port, 10);
    const c = new pg.Client({
      host: host!,
      user: user!,
      password: pass,
      port: Number.isFinite(portNum) && portNum > 0 ? portNum : 5432,
      database: probeDb,
    });
    try {
      await c.connect();
      await c.query("SELECT 1");
      console.log(`[verify] ops host probe (${probeDb}): connection OK`);
    } catch (e) {
      console.error(
        `[verify] ERROR: could not connect to existing database "${probeDb}" on TEMPLE_OPS host as TEMPLE_OPS_DB_USER:`,
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
