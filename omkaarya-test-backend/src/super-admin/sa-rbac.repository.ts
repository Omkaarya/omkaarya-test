import { requirePool } from "../db/pool.js";
import {
  deletePlatformUserByEmail,
  syncPlatformUserActiveByEmail,
  upsertPlatformSuperAdminUser,
} from "./sa-platform-user-sync.js";

export type AccessLevel = "none" | "view" | "full";

export type SaRoleDto = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  userCount?: number;
};

export type SaRolePermissionDto = {
  id: string;
  roleId: string;
  featureKey: string;
  accessLevel: AccessLevel;
};

export type SaUserDto = {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  /** Present only when a new login account was created with a temporary password. */
  tempPassword?: string | null;
};

export type CreateSaUserInput = {
  name: string;
  email: string;
  roleId?: string | null;
  isActive?: boolean;
};

export type UpdateSaUserInput = Partial<CreateSaUserInput>;

export type CreateSaRoleInput = {
  name: string;
  description?: string;
};

function rowToSaUser(r: {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}): SaUserDto {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    roleId: r.role_id,
    roleName: r.role_name,
    isActive: r.is_active,
    lastLogin: r.last_login,
    createdAt: r.created_at,
  };
}

function rowToSaRole(r: {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  user_count?: string;
}): SaRoleDto {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    isActive: r.is_active,
    createdAt: r.created_at,
    userCount: r.user_count ? parseInt(r.user_count, 10) : 0,
  };
}

export class PostgresSaRbacRepository {
  async fetchAllSaUsers(): Promise<SaUserDto[]> {
    const pool = requirePool();
    const result = await pool.query(`
    SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name,
           u.is_active, u.last_login, u.created_at
    FROM sa_users u
    LEFT JOIN sa_roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
  `);
    return result.rows.map(rowToSaUser);
  }

  async fetchSaUserById(id: string): Promise<SaUserDto | null> {
    const pool = requirePool();
    const result = await pool.query(
      `
    SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name,
           u.is_active, u.last_login, u.created_at
    FROM sa_users u
    LEFT JOIN sa_roles r ON r.id = u.role_id
    WHERE u.id = $1
  `,
      [id]
    );
    if (result.rows.length === 0) return null;
    return rowToSaUser(result.rows[0]);
  }

  async insertSaUser(input: CreateSaUserInput): Promise<SaUserDto> {
    const pool = requirePool();
    const client = await pool.connect();
    let tempPassword: string | null = null;
    try {
      await client.query("BEGIN");
      const platform = await upsertPlatformSuperAdminUser(client, {
        email: input.email,
        fullName: input.name,
        isActive: input.isActive ?? true,
      });
      tempPassword = platform.tempPassword;

      const result = await client.query<{ id: string }>(
        `INSERT INTO sa_users (name, email, role_id, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [input.name, input.email.trim().toLowerCase(), input.roleId ?? null, input.isActive ?? true]
      );
      await client.query("COMMIT");
      const user = (await this.fetchSaUserById(result.rows[0]!.id))!;
      return { ...user, tempPassword };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async updateSaUser(id: string, input: UpdateSaUserInput): Promise<SaUserDto | null> {
    const pool = requirePool();
    const sets: string[] = [];
    const vals: unknown[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      sets.push(`name = $${idx++}`);
      vals.push(input.name);
    }
    if (input.email !== undefined) {
      sets.push(`email = $${idx++}`);
      vals.push(input.email);
    }
    if (input.roleId !== undefined) {
      sets.push(`role_id = $${idx++}`);
      vals.push(input.roleId);
    }
    if (input.isActive !== undefined) {
      sets.push(`is_active = $${idx++}`);
      vals.push(input.isActive);
    }
    if (sets.length === 0) return this.fetchSaUserById(id);

    sets.push(`updated_at = NOW()`);
    vals.push(id);
    await pool.query(`UPDATE sa_users SET ${sets.join(", ")} WHERE id = $${idx}`, vals);
    return this.fetchSaUserById(id);
  }

  async toggleSaUserActive(id: string): Promise<SaUserDto | null> {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<{ email: string; is_active: boolean }>(
        `UPDATE sa_users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1
         RETURNING email, is_active`,
        [id]
      );
      if (current.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }
      const row = current.rows[0]!;
      await syncPlatformUserActiveByEmail(client, row.email, row.is_active);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    return this.fetchSaUserById(id);
  }

  async deleteSaUser(id: string): Promise<boolean> {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query<{ email: string }>(
        `SELECT email FROM sa_users WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (existing.rows.length === 0) {
        await client.query("ROLLBACK");
        return false;
      }
      await client.query(`DELETE FROM sa_users WHERE id = $1`, [id]);
      await deletePlatformUserByEmail(client, existing.rows[0]!.email);
      await client.query("COMMIT");
      return true;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async fetchAllSaRoles(): Promise<SaRoleDto[]> {
    const pool = requirePool();
    const result = await pool.query(`
    SELECT r.id, r.name, r.description, r.is_active, r.created_at,
           COUNT(u.id)::text AS user_count
    FROM sa_roles r
    LEFT JOIN sa_users u ON u.role_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at DESC, r.id
  `);
    return result.rows.map(rowToSaRole);
  }

  async fetchRolePermissions(roleId: string): Promise<SaRolePermissionDto[]> {
    const pool = requirePool();
    const result = await pool.query(
      `
    SELECT id, role_id, feature_key, access_level
    FROM sa_role_permissions
    WHERE role_id = $1
    ORDER BY feature_key
  `,
      [roleId]
    );
    return result.rows.map((r) => ({
      id: r.id,
      roleId: r.role_id,
      featureKey: r.feature_key,
      accessLevel: r.access_level as AccessLevel,
    }));
  }

  async saveRolePermissions(
    roleId: string,
    permissions: Array<{ featureKey: string; accessLevel: AccessLevel }>
  ): Promise<void> {
    const pool = requirePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM sa_role_permissions WHERE role_id = $1`, [roleId]);
      if (permissions.length > 0) {
        const values = permissions.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(", ");
        const flat: unknown[] = [roleId];
        permissions.forEach((perm) => flat.push(perm.featureKey, perm.accessLevel));
        await client.query(
          `INSERT INTO sa_role_permissions (role_id, feature_key, access_level) VALUES ${values}`,
          flat
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async touchLastLogin(email: string): Promise<void> {
    const pool = requirePool();
    await pool.query(
      `UPDATE sa_users SET last_login = NOW(), updated_at = NOW()
       WHERE lower(trim(email)) = lower(trim($1))`,
      [email.trim()]
    );
  }

  async insertSaRole(input: CreateSaRoleInput): Promise<SaRoleDto> {
    const pool = requirePool();
    const result = await pool.query(
      `
    INSERT INTO sa_roles (name, description)
    VALUES ($1, $2)
    RETURNING id, name, description, is_active, created_at
  `,
      [input.name, input.description ?? ""]
    );
    return rowToSaRole({ ...result.rows[0], user_count: "0" });
  }
}
