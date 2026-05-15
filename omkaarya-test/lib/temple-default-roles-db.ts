/**
 * Persisted overrides for temple default role templates (super-admin).
 * Falls back to seeded defaults in `temple-default-roles.ts` when no rows exist.
 */

import { Pool } from "pg";
import type { AccessLevel } from "@/lib/sa-users-db";
import { getPoolConfig } from "@/lib/pg-config";
import {
  accessEntriesToTemplePermissions,
  defaultTempleRoleAccessEntries,
  templePermissionsToAccessEntries,
} from "@/lib/temple-default-roles";

export type TempleRolePermissionEntry = {
  featureKey: string;
  accessLevel: AccessLevel;
};

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Database not configured. Set DATABASE_URL or DB env vars.");
  }
  if (!pool) pool = new Pool(config);
  return pool;
}

async function ensureTable(): Promise<void> {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS temple_default_role_permissions (
      role_slug TEXT NOT NULL,
      feature_key TEXT NOT NULL,
      access_level TEXT NOT NULL CHECK (access_level IN ('none', 'view', 'full')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (role_slug, feature_key)
    )
  `);
}

export async function fetchTempleDefaultRolePermissions(
  roleSlug: string
): Promise<TempleRolePermissionEntry[]> {
  const p = getPool();
  await ensureTable();
  const result = await p.query<{ feature_key: string; access_level: string }>(
    `SELECT feature_key, access_level
     FROM temple_default_role_permissions
     WHERE role_slug = $1 AND access_level <> 'none'
     ORDER BY feature_key`,
    [roleSlug]
  );

  if (result.rows.length === 0) {
    return defaultTempleRoleAccessEntries(roleSlug);
  }

  return result.rows.map((r) => ({
    featureKey: r.feature_key,
    accessLevel: r.access_level as AccessLevel,
  }));
}

export async function saveTempleDefaultRolePermissions(
  roleSlug: string,
  permissions: TempleRolePermissionEntry[]
): Promise<TempleRolePermissionEntry[]> {
  const p = getPool();
  await ensureTable();
  await p.query(`DELETE FROM temple_default_role_permissions WHERE role_slug = $1`, [roleSlug]);

  const granted = permissions.filter((perm) => perm.accessLevel !== "none");
  if (granted.length > 0) {
    const values = granted
      .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
      .join(", ");
    const flat: unknown[] = [roleSlug];
    granted.forEach((perm) => flat.push(perm.featureKey, perm.accessLevel));
    await p.query(
      `INSERT INTO temple_default_role_permissions (role_slug, feature_key, access_level) VALUES ${values}`,
      flat
    );
  }

  return fetchTempleDefaultRolePermissions(roleSlug);
}

/** Stored resource.action strings for seeding new temples (includes DB overrides). */
export async function fetchTempleDefaultRolePermissionStrings(roleSlug: string): Promise<string[]> {
  const entries = await fetchTempleDefaultRolePermissions(roleSlug);
  return accessEntriesToTemplePermissions(entries);
}

export { templePermissionsToAccessEntries };
