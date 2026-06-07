import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresSaRbacRepository } from "./sa-rbac.repository.js";
import { isUuidString } from "./is-uuid-string.js";
import { requireSaAdminManagement } from "./middleware/require-sa-admin-management.js";

const ACCESS_LEVELS = new Set(["none", "view", "full"]);

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

export function createSaRbacRouter(repo: PostgresSaRbacRepository): Router {
  const r = Router();

  r.get(
    "/admin-users",
    asyncHandler(async (_req, res) => {
      const users = await repo.fetchAllSaUsers();
      sendSuccess(res, 200, users, "Admin users loaded", "All super admin users returned.");
    })
  );

  r.post(
    "/admin-users",
    requireSaAdminManagement,
    asyncHandler(async (req, res) => {
      const { name, email, roleId, isActive } = req.body ?? {};
      if (!name || !email) {
        throw new HttpError(400, "name and email are required", {
          code: "VALIDATION_ERROR",
          reason: "Provide both name and email in the request body.",
        });
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new HttpError(400, "Invalid email", {
          code: "VALIDATION_ERROR",
          reason: "Provide a valid email address.",
        });
      }
      try {
        const user = await repo.insertSaUser({ name, email: normalizedEmail, roleId, isActive });
        sendSuccess(
          res,
          201,
          user,
          "Admin user created",
          user.tempPassword
            ? "A new super admin user was added. Share the temporary password securely for first login."
            : "A new super admin user was added to the system."
        );
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes("unique") || message.includes("duplicate")) {
          throw new HttpError(409, "Email already exists", {
            code: "EMAIL_CONFLICT",
            reason: "Another user already uses this email address.",
          });
        }
        throw e;
      }
    })
  );

  r.get(
    "/admin-users/:id",
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid user ID", { code: "INVALID_ID", reason: "ID must be a UUID." });
      }
      const user = await repo.fetchSaUserById(id);
      if (!user) {
        throw new HttpError(404, "User not found", {
          code: "USER_NOT_FOUND",
          reason: `No admin user with id ${id} exists.`,
        });
      }
      sendSuccess(res, 200, user, "User loaded", "Admin user record returned.");
    })
  );

  r.patch(
    "/admin-users/:id",
    requireSaAdminManagement,
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid user ID", { code: "INVALID_ID", reason: "ID must be a UUID." });
      }
      const body = req.body ?? {};
      if (body.toggleActive === true) {
        const user = await repo.toggleSaUserActive(id);
        if (!user) {
          throw new HttpError(404, "User not found", {
            code: "USER_NOT_FOUND",
            reason: `No admin user with id ${id}.`,
          });
        }
        sendSuccess(
          res,
          200,
          user,
          "User status toggled",
          `User is now ${user.isActive ? "active" : "inactive"}.`
        );
        return;
      }
      const user = await repo.updateSaUser(id, body);
      if (!user) {
        throw new HttpError(404, "User not found", {
          code: "USER_NOT_FOUND",
          reason: `No admin user with id ${id}.`,
        });
      }
      sendSuccess(res, 200, user, "User updated", "Admin user record updated.");
    })
  );

  r.delete(
    "/admin-users/:id",
    requireSaAdminManagement,
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid user ID", { code: "INVALID_ID", reason: "ID must be a UUID." });
      }
      const deleted = await repo.deleteSaUser(id);
      if (!deleted) {
        throw new HttpError(404, "User not found", {
          code: "USER_NOT_FOUND",
          reason: `No admin user with id ${id}.`,
        });
      }
      sendSuccess(res, 200, { id }, "User deleted", "The admin user was permanently removed.");
    })
  );

  r.get(
    "/admin-roles",
    asyncHandler(async (_req, res) => {
      const roles = await repo.fetchAllSaRoles();
      sendSuccess(res, 200, roles, "Admin roles loaded", "All super admin roles with user counts returned.");
    })
  );

  r.post(
    "/admin-roles",
    requireSaAdminManagement,
    asyncHandler(async (req, res) => {
      const { name, description } = req.body ?? {};
      if (!name) {
        throw new HttpError(400, "name is required", {
          code: "VALIDATION_ERROR",
          reason: "Provide a role name in the request body.",
        });
      }
      try {
        const role = await repo.insertSaRole({ name, description });
        sendSuccess(res, 201, role, "Role created", "A new super admin role was created.");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes("unique") || message.includes("duplicate")) {
          throw new HttpError(409, "Role name already exists", {
            code: "ROLE_NAME_CONFLICT",
            reason: "Another role already has this name.",
          });
        }
        throw e;
      }
    })
  );

  r.get(
    "/admin-roles/:id/permissions",
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid role ID", { code: "INVALID_ID", reason: "ID must be a UUID." });
      }
      const permissions = await repo.fetchRolePermissions(id);
      sendSuccess(res, 200, permissions, "Role permissions loaded", `Permissions for role ${id} returned.`);
    })
  );

  r.put(
    "/admin-roles/:id/permissions",
    requireSaAdminManagement,
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid role ID", { code: "INVALID_ID", reason: "ID must be a UUID." });
      }
      const { permissions } = req.body ?? {};
      if (!Array.isArray(permissions)) {
        throw new HttpError(400, "permissions must be an array", {
          code: "VALIDATION_ERROR",
          reason: "Provide a permissions array in the request body.",
        });
      }
      for (const perm of permissions) {
        const level = (perm as { accessLevel?: string })?.accessLevel;
        if (!level || !ACCESS_LEVELS.has(level)) {
          throw new HttpError(400, "Invalid access level", {
            code: "VALIDATION_ERROR",
            reason: 'Each permission accessLevel must be "none", "view", or "full".',
          });
        }
      }
      await repo.saveRolePermissions(id, permissions);
      const saved = await repo.fetchRolePermissions(id);
      sendSuccess(res, 200, saved, "Permissions saved", `Permissions for role ${id} updated successfully.`);
    })
  );

  return r;
}
