/**
 * Smoke test: inserts a user with a temp password, POSTs /api/set-password, verifies hash, cleans up.
 * Requires DATABASE_URL, a running API (default http://localhost:4000), and reachable PostgreSQL.
 *
 * Usage (from omkaarya-test-backend): npm run verify:set-password
 */
import pg from "pg";
import { loadEnvFile } from "../src/load-env.js";

loadEnvFile();

const API_BASE = (process.env.API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.log("[verify:set-password] SKIP: DATABASE_URL is not set.");
    process.exit(0);
  }

  const email = `omkaarya.verify.setpwd.${Date.now()}@example.com`;
  const tempPassword = `temp-${Math.random().toString(36).slice(2, 10)}`;
  const newPassword = `newPass-${Math.random().toString(36).slice(2, 12)}A1!`;

  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    await pool.query(
      `INSERT INTO public.users (email, temp_password)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET temp_password = EXCLUDED.temp_password, password_hash = NULL`,
      [email, tempPassword]
    );

    const res = await fetch(`${API_BASE}/api/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, tempPassword, newPassword }),
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;

    if (!res.ok) {
      console.error("[verify:set-password] FAIL: HTTP", res.status, body);
      process.exit(1);
    }

    const row = await pool.query<{ password_hash: string | null; temp_password: string | null }>(
      "SELECT password_hash, temp_password FROM public.users WHERE email = $1",
      [email]
    );
    if (row.rows.length !== 1 || !row.rows[0]!.password_hash || row.rows[0]!.temp_password != null) {
      console.error("[verify:set-password] FAIL: DB state after set-password", row.rows[0]);
      process.exit(1);
    }

    await pool.query("DELETE FROM public.users WHERE email = $1", [email]);

    console.log("[verify:set-password] OK: POST /api/set-password updated password_hash and cleared temp_password.");
    process.exit(0);
  } catch (e) {
    console.error("[verify:set-password] FAIL:", e);
    try {
      await pool.query("DELETE FROM public.users WHERE email = $1", [email]);
    } catch {
      /* ignore cleanup errors */
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
