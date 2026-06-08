import type { Pool } from "pg";

export type RoleRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  required_plan: string;
  user_count: number;
  permission_count: number;
};

export type RolePermissionRow = {
  id: string;
  role_id: string;
  module_key: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

export type StaffMemberRow = {
  id: string;
  external_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  phone_country_code: string | null;
  role_id: string | null;
  role_slug: string | null;
  role_name: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  joined_at: string | null;
  notes: string | null;
};

export type StaffInvitationRow = {
  id: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  invited_by: string | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

// ---------- Roles ----------

export async function listRoles(pool: Pool): Promise<RoleRow[]> {
  const { rows } = await pool.query<RoleRow>(
    `SELECT r.id::text AS id, r.slug, r.name, r.description, r.is_system, r.required_plan,
            COALESCE(uc.cnt, 0)::int AS user_count,
            COALESCE(pc.cnt, 0)::int AS permission_count
       FROM roles r
       LEFT JOIN (
         SELECT role_id, COUNT(*) AS cnt FROM staff_members
          WHERE deleted_at IS NULL GROUP BY role_id
       ) uc ON uc.role_id = r.id
       LEFT JOIN (
         SELECT role_id, COUNT(*) FILTER (
           WHERE can_create OR can_read OR can_update OR can_delete
         ) AS cnt FROM role_permissions GROUP BY role_id
       ) pc ON pc.role_id = r.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC`
  );
  return rows;
}

export async function getRoleBySlug(pool: Pool, slug: string): Promise<RoleRow | null> {
  const { rows } = await pool.query<RoleRow>(
    `SELECT r.id::text AS id, r.slug, r.name, r.description, r.is_system, r.required_plan,
            0::int AS user_count, 0::int AS permission_count
       FROM roles r
      WHERE r.slug = $1 AND r.deleted_at IS NULL
      LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}

export type InsertRoleInput = {
  slug: string;
  name: string;
  description: string | null;
  requiredPlan: string;
};

export async function insertRole(pool: Pool, input: InsertRoleInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO roles (slug, name, description, is_system, required_plan)
     VALUES ($1,$2,$3,false,$4)
     RETURNING id::text AS id`,
    [input.slug.trim(), input.name.trim(), input.description?.trim() || null, input.requiredPlan]
  );
  return { id: rows[0]!.id };
}

export async function updateRole(
  pool: Pool,
  id: string,
  input: Partial<{ name: string; description: string | null; requiredPlan: string }>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (input.name !== undefined) {
    sets.push(`name = $${i++}`);
    params.push(input.name.trim());
  }
  if (input.description !== undefined) {
    sets.push(`description = $${i++}`);
    params.push(input.description?.trim() || null);
  }
  if (input.requiredPlan !== undefined) {
    sets.push(`required_plan = $${i++}`);
    params.push(input.requiredPlan);
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(
    `UPDATE roles SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL AND is_system = false`,
    params
  );
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteRole(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE roles SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL AND is_system = false`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- Role permissions ----------

export async function listRolePermissions(pool: Pool, roleId: string): Promise<RolePermissionRow[]> {
  const { rows } = await pool.query<RolePermissionRow>(
    `SELECT id::text AS id, role_id::text AS role_id, module_key,
            can_create, can_read, can_update, can_delete
       FROM role_permissions
      WHERE role_id = $1
      ORDER BY module_key ASC`,
    [roleId]
  );
  return rows;
}

export async function upsertRolePermission(
  pool: Pool,
  roleId: string,
  moduleKey: string,
  perms: { canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }
): Promise<void> {
  await pool.query(
    `INSERT INTO role_permissions (role_id, module_key, can_create, can_read, can_update, can_delete)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (role_id, module_key) DO UPDATE SET
       can_create = EXCLUDED.can_create,
       can_read   = EXCLUDED.can_read,
       can_update = EXCLUDED.can_update,
       can_delete = EXCLUDED.can_delete,
       updated_at = NOW()`,
    [roleId, moduleKey, perms.canCreate, perms.canRead, perms.canUpdate, perms.canDelete]
  );
}

// ---------- Staff members ----------

export async function listStaffMembers(pool: Pool): Promise<StaffMemberRow[]> {
  const { rows } = await pool.query<StaffMemberRow>(
    `SELECT s.id::text AS id, s.external_id, s.first_name, s.last_name, s.email,
            s.phone, s.phone_country_code, s.role_id::text AS role_id,
            r.slug AS role_slug, r.name AS role_name,
            s.status, s.joined_at::text AS joined_at, s.notes
       FROM staff_members s
       LEFT JOIN roles r ON r.id = s.role_id
      WHERE s.deleted_at IS NULL
      ORDER BY s.created_at DESC`
  );
  return rows;
}

export type InsertStaffMemberInput = {
  externalId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  phoneCountryCode: string | null;
  roleSlug: string | null;
  status: "active" | "inactive" | "pending" | "suspended";
  joinedAt: string | null;
  notes: string | null;
};

export async function insertStaffMember(
  pool: Pool,
  input: InsertStaffMemberInput
): Promise<{ id: string }> {
  const roleId = input.roleSlug
    ? (await getRoleBySlug(pool, input.roleSlug))?.id ?? null
    : null;
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO staff_members (
       external_id, first_name, last_name, email, phone, phone_country_code,
       role_id, status, joined_at, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id::text AS id`,
    [
      input.externalId?.trim() || null,
      input.firstName.trim(),
      input.lastName.trim(),
      input.email.trim().toLowerCase(),
      input.phone?.trim() || null,
      input.phoneCountryCode?.trim() || null,
      roleId,
      input.status,
      input.joinedAt,
      input.notes?.trim() || null,
    ]
  );
  return { id: rows[0]!.id };
}

export async function updateStaffMember(
  pool: Pool,
  id: string,
  input: Partial<InsertStaffMemberInput>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  let roleId: string | null | undefined;
  if (input.roleSlug !== undefined) {
    roleId = input.roleSlug ? (await getRoleBySlug(pool, input.roleSlug))?.id ?? null : null;
  }
  const map: Array<[keyof InsertStaffMemberInput, string, () => unknown]> = [
    ["externalId", "external_id", () => input.externalId?.trim() || null],
    ["firstName", "first_name", () => input.firstName?.trim()],
    ["lastName", "last_name", () => input.lastName?.trim()],
    ["email", "email", () => input.email?.trim().toLowerCase()],
    ["phone", "phone", () => input.phone?.trim() || null],
    ["phoneCountryCode", "phone_country_code", () => input.phoneCountryCode?.trim() || null],
    ["status", "status", () => input.status],
    ["joinedAt", "joined_at", () => input.joinedAt],
    ["notes", "notes", () => input.notes?.trim() || null],
  ];
  for (const [k, col, val] of map) {
    if (input[k] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val());
    }
  }
  if (roleId !== undefined) {
    sets.push(`role_id = $${i++}`);
    params.push(roleId);
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(
    `UPDATE staff_members SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`,
    params
  );
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteStaffMember(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE staff_members SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- Staff invitations ----------

export async function listStaffInvitations(pool: Pool): Promise<StaffInvitationRow[]> {
  const { rows } = await pool.query<StaffInvitationRow>(
    `SELECT i.id::text AS id, i.email, i.role_id::text AS role_id, r.name AS role_name,
            i.invited_by, i.status, i.expires_at::text AS expires_at,
            i.accepted_at::text AS accepted_at, i.created_at::text AS created_at
       FROM staff_invitations i
       LEFT JOIN roles r ON r.id = i.role_id
      ORDER BY i.created_at DESC`
  );
  return rows;
}

export async function insertStaffInvitation(
  pool: Pool,
  input: { email: string; roleSlug: string | null; invitedBy: string | null; expiresAt: string | null }
): Promise<{ id: string; inviteToken: string }> {
  const roleId = input.roleSlug
    ? (await getRoleBySlug(pool, input.roleSlug))?.id ?? null
    : null;
  const inviteToken = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO staff_invitations (email, role_id, invited_by, status, invite_token, expires_at)
     VALUES ($1,$2,$3,'pending',$4,$5)
     RETURNING id::text AS id`,
    [input.email.trim().toLowerCase(), roleId, input.invitedBy?.trim() || null, inviteToken, input.expiresAt]
  );
  return { id: rows[0]!.id, inviteToken };
}

export async function revokeStaffInvitation(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE staff_invitations SET status = 'revoked' WHERE id = $1 AND status = 'pending'`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}
