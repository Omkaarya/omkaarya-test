import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { PostgresTempleDefaultRolePermissionsRepository } from "./temple-default-role-permissions.repository.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

export function createTempleDefaultRolesAdminRouter(repo: PostgresTempleDefaultRolePermissionsRepository): Router {
  const r = Router();

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
