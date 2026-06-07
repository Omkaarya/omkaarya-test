import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { hashPasswordCredential } from "./password-credentials.js";

export function generateInviteTempPassword(): string {
  return crypto.randomBytes(9).toString("base64url").slice(0, 12);
}

/** Ensures a platform login row exists for a super-admin portal user. */
export async function upsertPlatformSuperAdminUser(
  client: PoolClient,
  input: { email: string; fullName: string; isActive: boolean; tempPassword?: string }
): Promise<{ platformUserId: string; tempPassword: string | null }> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const roles = ["Super Admin"];
  const plainTemp = input.tempPassword?.trim() || generateInviteTempPassword();
  const tempHash = await hashPasswordCredential(plainTemp);

  const existing = await client.query<{ id: string; password_hash: string | null }>(
    `SELECT id, password_hash FROM public.users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1`,
    [email]
  );

  if (existing.rows.length === 0) {
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO public.users (email, full_name, temp_password, roles)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, fullName || null, tempHash, roles]
    );
    return { platformUserId: inserted.rows[0]!.id, tempPassword: plainTemp };
  }

  const row = existing.rows[0]!;
  await client.query(
    `UPDATE public.users
     SET full_name = COALESCE(NULLIF($2, ''), full_name),
         roles = (
           SELECT ARRAY(
             SELECT DISTINCT unnest(
               COALESCE(roles, ARRAY[]::text[]) || $3::text[]
             )
           )
         ),
         temp_password = CASE WHEN password_hash IS NULL THEN $4 ELSE temp_password END
     WHERE id = $1`,
    [row.id, fullName, roles, tempHash]
  );

  return {
    platformUserId: row.id,
    tempPassword: row.password_hash ? null : plainTemp,
  };
}

export async function syncPlatformUserActiveByEmail(
  client: PoolClient,
  email: string,
  isActive: boolean
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (isActive) {
    await client.query(
      `UPDATE public.users
       SET roles = (
         SELECT ARRAY(
           SELECT DISTINCT unnest(COALESCE(roles, ARRAY[]::text[]) || ARRAY['Super Admin']::text[])
         )
       )
       WHERE lower(trim(email)) = lower(trim($1))`,
      [normalized]
    );
    return;
  }

  await client.query(
    `UPDATE public.users
     SET roles = (
       SELECT COALESCE(array_agg(r), ARRAY[]::text[])
       FROM unnest(COALESCE(roles, ARRAY[]::text[])) AS r
       WHERE lower(trim(r)) NOT IN ('super admin', 'superadmin')
     )
     WHERE lower(trim(email)) = lower(trim($1))`,
    [normalized]
  );
}

export async function deletePlatformUserByEmail(client: PoolClient, email: string): Promise<void> {
  await client.query(`DELETE FROM public.users WHERE lower(trim(email)) = lower(trim($1))`, [email.trim()]);
}
