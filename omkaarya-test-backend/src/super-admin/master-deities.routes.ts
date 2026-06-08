import { Router } from "express";
import type { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import type { PostgresMasterDeitiesRepository } from "./master-deities.repository.js";
import {
  createMasterDeityBodySchema,
  masterDeityIdParamSchema,
  updateMasterDeityBodySchema,
} from "./validation.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

function asQueryString(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v);
}

function requireMasterDeityId(raw: string | string[] | undefined): string {
  const parsed = masterDeityIdParamSchema.safeParse(asSingleParam(raw)?.trim());
  if (!parsed.success) {
    throw new HttpError(400, "Invalid deity id", {
      code: "INVALID_ID",
      reason: "The id in the path must be a UUID for `master_deities.id`.",
    });
  }
  return parsed.data;
}

function parseStatus(raw: string): "all" | "active" | "inactive" {
  const s = raw.trim().toLowerCase();
  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  return "all";
}

function parseSortBy(raw: string): "name" | "last7" | "timeline" {
  const s = raw.trim().toLowerCase();
  if (s === "name") return "name";
  return "timeline";
}

export function createMasterDeitiesRouter(repo: PostgresMasterDeitiesRepository): Router {
  const r = Router();

  r.get(
    "/super-admin/deities",
    asyncHandler(async (req, res) => {
      const q = asQueryString(req.query.q);
      const status = parseStatus(asQueryString(req.query.status));
      const country = asQueryString(req.query.country) || "all";
      const sortBy = parseSortBy(asQueryString(req.query.sortBy));
      const page = Math.max(1, parseInt(asQueryString(req.query.page) || "1", 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(asQueryString(req.query.pageSize) || "10", 10) || 10));

      const data = await repo.listPaged({ q, status, country, sortBy, page, pageSize });
      sendSuccess(
        res,
        200,
        data,
        "Deities loaded",
        "Paginated master deities with filters for the super-admin Deities screen."
      );
    })
  );

  r.post(
    "/super-admin/deities",
    validateBody(createMasterDeityBodySchema),
    asyncHandler(async (req, res) => {
      const body = req.body as z.infer<typeof createMasterDeityBodySchema>;
      try {
        const row = await repo.create({
          name: body.name,
          secondaryLabel: body.secondaryLabel ?? null,
          isActive: body.isActive ?? true,
          countryCode: body.countryCode ?? null,
          placeholderHue: body.placeholderHue ?? null,
          imageDataUrl: body.imageDataUrl ?? null,
          slug: body.slug ?? null,
        });
        sendSuccess(res, 201, row, "Deity created", "A new `master_deities` row was inserted.");
      } catch (e) {
        if (e instanceof Error && e.message === "SLUG_CONFLICT") {
          throw new HttpError(409, "Slug already in use", {
            code: "SLUG_CONFLICT",
            reason: "Choose a different slug or omit it to auto-generate from the name.",
          });
        }
        throw e;
      }
    })
  );

  r.get(
    "/super-admin/deities/:id",
    asyncHandler(async (req, res) => {
      const id = requireMasterDeityId(req.params.id);
      const row = await repo.getById(id);
      if (!row) {
        throw new HttpError(404, "Deity not found", {
          code: "DEITY_NOT_FOUND",
          reason: "No `master_deities` row exists for this id.",
        });
      }
      sendSuccess(res, 200, row, "Deity loaded", "One master deity row.");
    })
  );

  r.patch(
    "/super-admin/deities/:id",
    validateBody(updateMasterDeityBodySchema),
    asyncHandler(async (req, res) => {
      const id = requireMasterDeityId(req.params.id);
      const body = req.body as z.infer<typeof updateMasterDeityBodySchema>;
      const row = await repo.update(id, {
        name: body.name,
        secondaryLabel: body.secondaryLabel,
        isActive: body.isActive,
        countryCode: body.countryCode,
        placeholderHue: body.placeholderHue,
        imageDataUrl: body.imageDataUrl,
      });
      if (!row) {
        throw new HttpError(404, "Deity not found", {
          code: "DEITY_NOT_FOUND",
          reason: "No `master_deities` row exists for this id.",
        });
      }
      sendSuccess(res, 200, row, "Deity updated", "The master deity row was updated.");
    })
  );

  r.delete(
    "/super-admin/deities/:id",
    asyncHandler(async (req, res) => {
      const id = requireMasterDeityId(req.params.id);
      const row = await repo.softDeactivate(id);
      if (!row) {
        throw new HttpError(404, "Deity not found", {
          code: "DEITY_NOT_FOUND",
          reason: "No `master_deities` row exists for this id.",
        });
      }
      sendSuccess(res, 200, row, "Deity deactivated", "`is_active` was set to false (soft delete).");
    })
  );

  return r;
}
