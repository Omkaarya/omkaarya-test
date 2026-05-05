import { getPool } from "../db/pool.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";

function templeAuthSyncStrict(): boolean {
  return process.env.TEMPLE_AUTH_SYNC_REQUIRED?.trim() === "1";
}

/**
 * Upserts `temple_auth_mirror` in the tenant's operational PostgreSQL database.
 */
export async function upsertTempleAuthMirror(input: {
  tenantId: string;
  platformUserId: number;
  email: string;
  passwordHash: string | null;
  tempPassword: string | null;
}): Promise<void> {
  const pool = await getOperationalPoolForTenant(input.tenantId.trim());
  if (!pool) {
    console.warn(
      `[temple-auth-mirror] no operational pool for tenant ${input.tenantId}; skipped (provision operational DB when ready)`
    );
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO temple_auth_mirror (platform_user_id, email, password_hash, temp_password, updated_at)
       VALUES ($1, lower(trim($2::text)), $3, $4, NOW())
       ON CONFLICT (email) DO UPDATE SET
         platform_user_id = EXCLUDED.platform_user_id,
         password_hash = EXCLUDED.password_hash,
         temp_password = EXCLUDED.temp_password,
         updated_at = NOW()`,
      [input.platformUserId, input.email, input.passwordHash, input.tempPassword]
    );
  } catch (e) {
    if (templeAuthSyncStrict()) {
      throw e;
    }
    console.warn("[temple-auth-mirror] upsert failed:", e);
  } finally {
    client.release();
  }
}

/**
 * Reads current credential fields from platform `public.users` and mirrors into the tenant operational DB.
 */
export async function syncTempleAuthMirrorFromPlatformUserId(platformUserId: number): Promise<void> {
  const pool = getPool();
  if (!pool) {
    return;
  }

  const res = await pool.query<{
    id: number;
    tenant_id: string | null;
    email: string;
    password_hash: string | null;
    temp_password: string | null;
  }>(
    `SELECT id, tenant_id, email, password_hash, temp_password FROM public.users WHERE id = $1 LIMIT 1`,
    [platformUserId]
  );

  if (res.rows.length === 0) {
    return;
  }

  const row = res.rows[0]!;
  if (row.tenant_id == null || row.tenant_id.trim() === "") {
    return;
  }

  await upsertTempleAuthMirror({
    tenantId: row.tenant_id.trim(),
    platformUserId: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    tempPassword: row.temp_password,
  });
}

export async function syncTempleAuthMirrorFromEmail(email: string): Promise<void> {
  const pool = getPool();
  if (!pool) {
    return;
  }
  const res = await pool.query<{ id: number }>(
    `SELECT id FROM public.users WHERE lower(trim(email)) = lower(trim($1::text)) LIMIT 1`,
    [email]
  );
  const id = res.rows[0]?.id;
  if (id == null) {
    return;
  }
  await syncTempleAuthMirrorFromPlatformUserId(id);
}
