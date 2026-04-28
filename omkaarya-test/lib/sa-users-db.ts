/**
 * Super Admin Users & Roles — Database layer
 * CRUD operations for `sa_users`, `sa_roles`, and `sa_role_permissions`.
 *
 * Uses the same pg Pool singleton pattern as features-db.ts.
 */

import { Pool } from "pg";
import { getPoolConfig } from "@/lib/pg-config";

// ── Types ──────────────────────────────────────────────────────────

export type AccessLevel = "none" | "view" | "full";

export type SaRole = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  userCount?: number;
};

export type SaRolePermission = {
  id: number;
  roleId: number;
  featureKey: string;
  accessLevel: AccessLevel;
};

export type SaUser = {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
};

export type CreateSaUserInput = {
  name: string;
  email: string;
  roleId?: number | null;
  isActive?: boolean;
};

export type UpdateSaUserInput = Partial<CreateSaUserInput>;

export type CreateSaRoleInput = {
  name: string;
  description?: string;
};

// ── Pool ───────────────────────────────────────────────────────────

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error("Database not configured. Set DATABASE_URL or DB env vars.");
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

// ── Row mappers ────────────────────────────────────────────────────

function rowToSaUser(r: {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}): SaUser {
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
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  user_count?: string;
}): SaRole {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    isActive: r.is_active,
    createdAt: r.created_at,
    userCount: r.user_count ? parseInt(r.user_count, 10) : 0,
  };
}

// ── SA User Queries ────────────────────────────────────────────────

/** List all super admin users with their role names. */
export async function fetchAllSaUsers(): Promise<SaUser[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name,
           u.is_active, u.last_login, u.created_at
    FROM sa_users u
    LEFT JOIN sa_roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
  `);
  return result.rows.map(rowToSaUser);
}

/** Get a single super admin user by ID. */
export async function fetchSaUserById(id: number): Promise<SaUser | null> {
  const p = getPool();
  const result = await p.query(`
    SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name,
           u.is_active, u.last_login, u.created_at
    FROM sa_users u
    LEFT JOIN sa_roles r ON r.id = u.role_id
    WHERE u.id = $1
  `, [id]);
  if (result.rows.length === 0) return null;
  return rowToSaUser(result.rows[0]);
}

/** Create a new super admin user. */
export async function insertSaUser(input: CreateSaUserInput): Promise<SaUser> {
  const p = getPool();
  const result = await p.query(`
    INSERT INTO sa_users (name, email, role_id, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role_id, is_active, last_login, created_at
  `, [input.name, input.email, input.roleId ?? null, input.isActive ?? true]);

  // Fetch with role_name join
  return fetchSaUserById(result.rows[0].id) as Promise<SaUser>;
}

/** Update a super admin user. */
export async function updateSaUser(id: number, input: UpdateSaUserInput): Promise<SaUser | null> {
  const p = getPool();
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (input.name !== undefined) { sets.push(`name = $${idx++}`); vals.push(input.name); }
  if (input.email !== undefined) { sets.push(`email = $${idx++}`); vals.push(input.email); }
  if (input.roleId !== undefined) { sets.push(`role_id = $${idx++}`); vals.push(input.roleId); }
  if (input.isActive !== undefined) { sets.push(`is_active = $${idx++}`); vals.push(input.isActive); }
  if (sets.length === 0) return fetchSaUserById(id);

  sets.push(`updated_at = NOW()`);
  vals.push(id);
  await p.query(
    `UPDATE sa_users SET ${sets.join(", ")} WHERE id = $${idx}`,
    vals
  );
  return fetchSaUserById(id);
}

/** Toggle active status for a super admin user. */
export async function toggleSaUserActive(id: number): Promise<SaUser | null> {
  const p = getPool();
  await p.query(
    `UPDATE sa_users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1`,
    [id]
  );
  return fetchSaUserById(id);
}

/** Delete a super admin user (hard delete — use with caution). */
export async function deleteSaUser(id: number): Promise<boolean> {
  const p = getPool();
  const result = await p.query(`DELETE FROM sa_users WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ── SA Role Queries ────────────────────────────────────────────────

/** List all roles with user counts. */
export async function fetchAllSaRoles(): Promise<SaRole[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT r.id, r.name, r.description, r.is_active, r.created_at,
           COUNT(u.id)::text AS user_count
    FROM sa_roles r
    LEFT JOIN sa_users u ON u.role_id = r.id
    GROUP BY r.id
    ORDER BY r.id
  `);
  return result.rows.map(rowToSaRole);
}

/** Get permissions for a role. */
export async function fetchRolePermissions(roleId: number): Promise<SaRolePermission[]> {
  const p = getPool();
  const result = await p.query(`
    SELECT id, role_id, feature_key, access_level
    FROM sa_role_permissions
    WHERE role_id = $1
    ORDER BY feature_key
  `, [roleId]);
  return result.rows.map((r) => ({
    id: r.id,
    roleId: r.role_id,
    featureKey: r.feature_key,
    accessLevel: r.access_level as AccessLevel,
  }));
}

/** Upsert permissions for a role (batch replace). */
export async function saveRolePermissions(
  roleId: number,
  permissions: Array<{ featureKey: string; accessLevel: AccessLevel }>
): Promise<void> {
  const p = getPool();
  // Remove all existing and re-insert (clean approach for small sets)
  await p.query(`DELETE FROM sa_role_permissions WHERE role_id = $1`, [roleId]);
  if (permissions.length === 0) return;
  const values = permissions
    .map((perm, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
    .join(", ");
  const flat: unknown[] = [roleId];
  permissions.forEach((perm) => flat.push(perm.featureKey, perm.accessLevel));
  await p.query(
    `INSERT INTO sa_role_permissions (role_id, feature_key, access_level) VALUES ${values}`,
    flat
  );
}

/** Create a new role. */
export async function insertSaRole(input: CreateSaRoleInput): Promise<SaRole> {
  const p = getPool();
  const result = await p.query(`
    INSERT INTO sa_roles (name, description)
    VALUES ($1, $2)
    RETURNING id, name, description, is_active, created_at
  `, [input.name, input.description ?? ""]);
  return rowToSaRole({ ...result.rows[0], user_count: "0" });
}
