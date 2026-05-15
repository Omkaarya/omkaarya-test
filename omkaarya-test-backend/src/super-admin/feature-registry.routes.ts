import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresFeatureRegistryRepository } from "./feature-registry.repository.js";
import { isUuidString } from "./is-uuid-string.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

export function createFeatureRegistryRouter(repo: PostgresFeatureRegistryRepository): Router {
  const r = Router();

  r.get(
    "/features",
    asyncHandler(async (_req, res) => {
      const features = await repo.fetchAllFeatures();
      sendSuccess(
        res,
        200,
        features,
        "Feature registry list loaded",
        "All feature definitions from the database are returned in display order."
      );
    })
  );

  r.post(
    "/features",
    asyncHandler(async (req, res) => {
      const { name, key, moduleKey, description, hasLimit, limitType, isVisibleInPlanConfig } = req.body ?? {};
      if (!name || !key || !moduleKey) {
        throw new HttpError(400, "name, key, and moduleKey are required", {
          code: "VALIDATION_ERROR",
          reason: "Provide all three string fields in the request body to create a feature.",
        });
      }
      try {
        const feature = await repo.insertFeature({
          name,
          key,
          moduleKey,
          description,
          hasLimit,
          limitType,
          isVisibleInPlanConfig,
        });
        sendSuccess(res, 201, feature, "Feature created", "A new row was inserted into the feature registry with the given key.");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes("unique") || message.includes("duplicate")) {
          throw new HttpError(409, "Feature key already exists", {
            code: "FEATURE_KEY_CONFLICT",
            reason: "Another feature already uses this key; choose a different key or update the existing row.",
          });
        }
        throw e;
      }
    })
  );

  r.put(
    "/features/:id",
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid feature ID", {
          code: "INVALID_ID",
          reason: "The path segment must be a UUID.",
        });
      }
      const feature = await repo.updateFeature(id, req.body ?? {});
      if (!feature) {
        throw new HttpError(404, "Feature not found", {
          code: "FEATURE_NOT_FOUND",
          reason: "No row exists for the given id.",
        });
      }
      sendSuccess(res, 200, feature, "Feature updated", "The feature registry row was written with the submitted fields.");
    })
  );

  r.patch(
    "/features/:id",
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim() ?? "";
      if (!isUuidString(id)) {
        throw new HttpError(400, "Invalid feature ID", {
          code: "INVALID_ID",
          reason: "The path segment must be a UUID.",
        });
      }
      const feature = await repo.toggleFeatureActive(id);
      if (!feature) {
        throw new HttpError(404, "Feature not found", {
          code: "FEATURE_NOT_FOUND",
          reason: "No row exists for the given id.",
        });
      }
      sendSuccess(res, 200, feature, "Feature toggled", "The feature's active flag was flipped and the updated row is returned.");
    })
  );

  return r;
}
