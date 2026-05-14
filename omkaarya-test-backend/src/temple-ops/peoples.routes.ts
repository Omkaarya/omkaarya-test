import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as repo from "./peoples.repository.js";
import { routeParam } from "./route-helpers.js";

const roleBodySchema = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits, and dashes only"),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  requiredPlan: z.string().max(40).optional().default("Prarambha"),
});

const rolePatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  requiredPlan: z.string().max(40).optional(),
});

const permissionsBodySchema = z.object({
  permissions: z
    .array(
      z.object({
        moduleKey: z.string().min(1).max(60),
        canCreate: z.boolean(),
        canRead: z.boolean(),
        canUpdate: z.boolean(),
        canDelete: z.boolean(),
      })
    )
    .min(1),
});

const staffBodySchema = z.object({
  externalId: z.string().max(60).nullable().optional(),
  firstName: z.string().min(1).max(120),
  lastName: z.string().max(120).optional().default(""),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  phoneCountryCode: z.string().max(8).nullable().optional(),
  roleSlug: z.string().max(60).nullable().optional(),
  status: z.enum(["active", "inactive", "pending", "suspended"]).optional().default("active"),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const staffPatchSchema = staffBodySchema.partial();

const inviteBodySchema = z.object({
  email: z.string().email().max(255),
  roleSlug: z.string().max(60).nullable().optional(),
  invitedBy: z.string().max(255).nullable().optional(),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/).nullable().optional(),
});

export function createTemplePeoplesRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  // ----- Roles -----
  r.get(
    "/roles",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listRoles(pool) : [];
      sendSuccess(res, 200, { items }, "Roles loaded", `${items.length} role(s) loaded.`);
    })
  );

  r.post(
    "/roles",
    validateBody(roleBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof roleBodySchema>;
      const existing = await repo.getRoleBySlug(pool, body.slug);
      if (existing) {
        throw new HttpError(409, "A role with this slug already exists.", {
          code: "ROLE_SLUG_TAKEN",
          reason: "Choose a different slug.",
        });
      }
      const created = await repo.insertRole(pool, {
        slug: body.slug,
        name: body.name,
        description: body.description ?? null,
        requiredPlan: body.requiredPlan ?? "Prarambha",
      });
      sendSuccess(res, 201, { id: created.id }, "Role created", "");
    })
  );

  r.patch(
    "/roles/:id",
    validateBody(rolePatchSchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateRole(pool, id, req.body as z.infer<typeof rolePatchSchema>);
      if (!ok) {
        throw new HttpError(404, "Role not found or is a system role.", { code: "ROLE_NOT_FOUND" });
      }
      sendSuccess(res, 200, { id }, "Role updated", "");
    })
  );

  r.delete(
    "/roles/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteRole(pool, id);
      if (!ok) {
        throw new HttpError(404, "Role not found or is a system role.", { code: "ROLE_NOT_FOUND" });
      }
      sendSuccess(res, 200, { id }, "Role deleted", "");
    })
  );

  // ----- Role permissions -----
  r.get(
    "/roles/:id/permissions",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const id = routeParam(req.params.id);
      const items = pool ? await repo.listRolePermissions(pool, id) : [];
      sendSuccess(res, 200, { items }, "Permissions loaded", `${items.length} permission(s) loaded.`);
    })
  );

  r.put(
    "/roles/:id/permissions",
    validateBody(permissionsBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof permissionsBodySchema>;
      for (const p of body.permissions) {
        await repo.upsertRolePermission(pool, id, p.moduleKey, {
          canCreate: p.canCreate,
          canRead: p.canRead,
          canUpdate: p.canUpdate,
          canDelete: p.canDelete,
        });
      }
      sendSuccess(res, 200, { roleId: id }, "Permissions saved", "");
    })
  );

  // ----- Staff members -----
  r.get(
    "/staff",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listStaffMembers(pool) : [];
      sendSuccess(res, 200, { items }, "Staff loaded", `${items.length} staff member(s) loaded.`);
    })
  );

  r.post(
    "/staff",
    validateBody(staffBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof staffBodySchema>;
      try {
        const created = await repo.insertStaffMember(pool, {
          externalId: body.externalId ?? null,
          firstName: body.firstName,
          lastName: body.lastName ?? "",
          email: body.email,
          phone: body.phone ?? null,
          phoneCountryCode: body.phoneCountryCode ?? null,
          roleSlug: body.roleSlug ?? null,
          status: body.status ?? "active",
          joinedAt: body.joinedAt ?? null,
          notes: body.notes ?? null,
        });
        sendSuccess(res, 201, { id: created.id }, "Staff member added", "");
      } catch (e: unknown) {
        if (e instanceof Error && /unique constraint/i.test(e.message) && /email/i.test(e.message)) {
          throw new HttpError(409, "A staff member with this email already exists.", {
            code: "STAFF_EMAIL_TAKEN",
          });
        }
        throw e;
      }
    })
  );

  r.patch(
    "/staff/:id",
    validateBody(staffPatchSchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateStaffMember(pool, id, req.body as z.infer<typeof staffPatchSchema>);
      if (!ok) {
        throw new HttpError(404, "Staff member not found.", { code: "STAFF_NOT_FOUND" });
      }
      sendSuccess(res, 200, { id }, "Staff member updated", "");
    })
  );

  r.delete(
    "/staff/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteStaffMember(pool, id);
      if (!ok) {
        throw new HttpError(404, "Staff member not found.", { code: "STAFF_NOT_FOUND" });
      }
      sendSuccess(res, 200, { id }, "Staff member removed", "");
    })
  );

  // ----- Staff invitations -----
  r.get(
    "/invitations",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listStaffInvitations(pool) : [];
      sendSuccess(res, 200, { items }, "Invitations loaded", `${items.length} invitation(s) loaded.`);
    })
  );

  r.post(
    "/invitations",
    validateBody(inviteBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof inviteBodySchema>;
      const created = await repo.insertStaffInvitation(pool, {
        email: body.email,
        roleSlug: body.roleSlug ?? null,
        invitedBy: body.invitedBy ?? null,
        expiresAt: body.expiresAt ?? null,
      });
      sendSuccess(
        res,
        201,
        { id: created.id, inviteToken: created.inviteToken },
        "Invitation created",
        "Share the invite token with the recipient."
      );
    })
  );

  r.delete(
    "/invitations/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.revokeStaffInvitation(pool, id);
      if (!ok) {
        throw new HttpError(404, "Pending invitation not found.", { code: "INVITATION_NOT_FOUND" });
      }
      sendSuccess(res, 200, { id }, "Invitation revoked", "");
    })
  );

  return r;
}
