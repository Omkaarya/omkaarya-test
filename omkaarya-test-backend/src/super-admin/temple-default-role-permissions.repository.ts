import { requirePool } from "../db/pool.js";
import {
  defaultTempleRoleAccessEntries,
  type AccessLevel,
  isTempleDefaultRoleSlug,
} from "./temple-default-role-templates.js";

export type TempleRolePermissionEntry = {
  featureKey: string;
  accessLevel: AccessLevel;
};

export class PostgresTempleDefaultRolePermissionsRepository {
  private async ensureTable(): Promise<void> {
    const pool = requirePool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temple_default_role_permissions (
        role_slug TEXT NOT NULL,
        feature_key TEXT NOT NULL,
        access_level TEXT NOT NULL CHECK (access_level IN ('none', 'view', 'full')),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (role_slug, feature_key)
      )
    `);
  }

  async fetch(roleSlug: string): Promise<TempleRolePermissionEntry[]> {
    const pool = requirePool();
    await this.ensureTable();
    const result = await pool.query<{ feature_key: string; access_level: string }>(
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

  async save(roleSlug: string, permissions: TempleRolePermissionEntry[]): Promise<TempleRolePermissionEntry[]> {
    const pool = requirePool();
    await this.ensureTable();
    await pool.query(`DELETE FROM temple_default_role_permissions WHERE role_slug = $1`, [roleSlug]);

    const granted = permissions.filter((perm) => perm.accessLevel !== "none");
    if (granted.length > 0) {
      const values = granted.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ");
      const flat: unknown[] = [roleSlug];
      granted.forEach((perm) => flat.push(perm.featureKey, perm.accessLevel));
      await pool.query(
        `INSERT INTO temple_default_role_permissions (role_slug, feature_key, access_level) VALUES ${values}`,
        flat
      );
    }

    return this.fetch(roleSlug);
  }

  static validateSlug(slug: string): boolean {
    return isTempleDefaultRoleSlug(slug);
  }
}
