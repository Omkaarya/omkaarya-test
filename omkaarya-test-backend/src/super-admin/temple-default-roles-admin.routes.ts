import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { PostgresTempleDefaultRolePermissionsRepository } from "./temple-default-role-permissions.repository.js";
import { TEMPLE_DEFAULT_ROLES } from "./temple-default-role-templates.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

export function createTempleDefaultRolesAdminRouter(repo: PostgresTempleDefaultRolePermissionsRepository): Router {
  const r = Router();

  r.get(
    "/temple-default-roles",
    asyncHandler(async (_req, res) => {
      const roles = await Promise.all(
        TEMPLE_DEFAULT_ROLES.map(async (role) => {
          const entries = await repo.fetch(role.id);
          const permissionTags = entries.map((e) => `${e.featureKey}.${e.accessLevel}`);
          return {
            id: role.id,
            name: role.name,
            description: role.description,
            isSystem: role.isSystem,
            color: role.color,
            permissions: permissionTags,
            grantedCount: entries.length,
          };
        })
      );
      sendSuccess(
        res,
        200,
        roles,
        "Temple default roles loaded",
        "All default temple role templates with live permission tags from the database."
      );
    })
  );

  r.get(
    "/temple-default-roles/:slug/permissions",
    asyncHandler(async (req, res) => {
      const slug = (asSingleParam(req.params.slug) ?? "").trim();
      if (!PostgresTempleDefaultRolePermissionsRepository.validateSlug(slug)) {
        throw new HttpError(404, "Unknown temple role", {
          code: "ROLE_NOT_FOUND",
          reason: `No default temple role with slug "${slug}".`,
        });
      }
      const permissions = await repo.fetch(slug);
      sendSuccess(
        res,
        200,
        permissions,
        "Temple role permissions loaded",
        `Permissions for temple role "${slug}" returned.`
      );
    })
  );

  r.put(
    "/temple-default-roles/:slug/permissions",
    asyncHandler(async (req, res) => {
      const slug = (asSingleParam(req.params.slug) ?? "").trim();
      if (!PostgresTempleDefaultRolePermissionsRepository.validateSlug(slug)) {
        throw new HttpError(404, "Unknown temple role", {
          code: "ROLE_NOT_FOUND",
          reason: `No default temple role with slug "${slug}".`,
        });
      }
      const { permissions } = req.body ?? {};
      if (!Array.isArray(permissions)) {
        throw new HttpError(400, "permissions must be an array", {
          code: "VALIDATION_ERROR",
          reason: "Provide a permissions array in the request body.",
        });
      }
      const saved = await repo.save(slug, permissions);
      sendSuccess(
        res,
        200,
        saved,
        "Permissions saved",
        `Permissions for temple role "${slug}" updated successfully.`
      );
    })
  );

  return r;
}
