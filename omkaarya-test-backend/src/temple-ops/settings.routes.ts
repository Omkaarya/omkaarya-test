import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import {
  SETTINGS_AREAS,
  type SettingsArea,
  getSettingsArea,
  isSettingsArea,
  maskSettingsPayload,
  patchSettingsArea,
  replaceSettingsArea,
} from "./settings.repository.js";
import { routeParam } from "./route-helpers.js";

const patchBodySchema = z.object({
  payload: z.record(z.string(), z.unknown()),
});

const replaceBodySchema = z.object({
  payload: z.record(z.string(), z.unknown()),
});

function ensureArea(value: string): SettingsArea {
  if (!isSettingsArea(value)) {
    throw new HttpError(404, "Unknown settings area.", {
      code: "SETTINGS_AREA_UNKNOWN",
      reason: `Allowed areas: ${SETTINGS_AREAS.join(", ")}`,
    });
  }
  return value;
}

export function createTempleSettingsRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      if (!pool) {
        sendSuccess(res, 200, { areas: {} }, "Settings loaded", "Operational DB not configured.");
        return;
      }
      const out: Record<string, Record<string, unknown>> = {};
      for (const area of SETTINGS_AREAS) {
        const row = await getSettingsArea(pool, area);
        out[area] = row ? maskSettingsPayload(area, row.payload) : {};
      }
      sendSuccess(res, 200, { areas: out }, "Settings loaded", `${Object.keys(out).length} area(s) loaded.`);
    })
  );

  r.get(
    "/:area",
    asyncHandler(async (req, res) => {
      const area = ensureArea(routeParam(req.params.area));
      const pool = await getTenantPoolOrNull(res);
      const row = pool ? await getSettingsArea(pool, area) : null;
      const payload = row ? maskSettingsPayload(area, row.payload) : {};
      sendSuccess(res, 200, { area, payload, updatedAt: row?.updated_at ?? null }, "Settings area loaded", "");
    })
  );

  r.patch(
    "/:area",
    validateBody(patchBodySchema),
    asyncHandler(async (req, res) => {
      const area = ensureArea(routeParam(req.params.area));
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof patchBodySchema>;
      const result = await patchSettingsArea(pool, area, body.payload);
      sendSuccess(
        res,
        200,
        { area, payload: maskSettingsPayload(area, result.payload), updatedAt: result.updated_at },
        "Settings updated",
        ""
      );
    })
  );

  r.put(
    "/:area",
    validateBody(replaceBodySchema),
    asyncHandler(async (req, res) => {
      const area = ensureArea(routeParam(req.params.area));
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof replaceBodySchema>;
      const result = await replaceSettingsArea(pool, area, body.payload);
      sendSuccess(
        res,
        200,
        { area, payload: maskSettingsPayload(area, result.payload), updatedAt: result.updated_at },
        "Settings replaced",
        ""
      );
    })
  );

  return r;
}
