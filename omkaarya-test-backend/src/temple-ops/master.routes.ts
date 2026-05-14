import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as repo from "./master.repository.js";
import { routeParam } from "./route-helpers.js";

const sevaBodySchema = z.object({
  name: z.string().min(1).max(300),
  code: z.string().max(60).nullable().optional(),
  category: z.string().max(120).optional().default(""),
  durationMinutes: z.number().int().nonnegative().nullable().optional(),
  priceAmount: z.number().nonnegative().optional().default(0),
  currency: z.string().max(8).optional().default("INR"),
  prasadText: z.string().max(500).nullable().optional(),
  priestName: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  onlineEnabled: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

const sevaPatchSchema = sevaBodySchema.partial();

const scheduleBodySchema = z.object({
  poojaSevaId: z.string().nullable().optional(),
  poojaName: z.string().min(1).max(300),
  days: z.array(z.string()).default([]),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  priestName: z.string().max(200).nullable().optional(),
  maxSlots: z.number().int().nonnegative().nullable().optional(),
  cutoffHours: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const festivalBodySchema = z.object({
  name: z.string().min(1).max(300),
  festivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  category: z.string().max(120).optional().default(""),
  description: z.string().max(2000).nullable().optional(),
  priestName: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const panchBodySchema = z.object({
  panchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  festivalLabel: z.string().max(300).nullable().optional(),
  typeLabel: z.string().max(120).nullable().optional(),
  auspiciousLabel: z.string().max(120).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const uomBodySchema = z.object({
  kind: z.enum(["base", "bulk"]),
  name: z.string().min(1).max(120),
  abbreviation: z.string().min(1).max(20),
  typeLabel: z.string().max(60).optional().default("Unit (count)"),
  baseUnitId: z.string().nullable().optional(),
  quantityPerBulk: z.number().nonnegative().nullable().optional(),
});

const uomPatchSchema = uomBodySchema.partial();

export function createTempleMasterRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  // ----- Pooja Sevas -----
  r.get(
    "/pooja-sevas",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listPoojaSevas(pool) : [];
      sendSuccess(res, 200, { items }, "Pooja sevas loaded", `${items.length} item(s) loaded.`);
    })
  );

  r.post(
    "/pooja-sevas",
    validateBody(sevaBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof sevaBodySchema>;
      const created = await repo.insertPoojaSeva(pool, {
        name: body.name,
        code: body.code ?? null,
        category: body.category ?? "",
        durationMinutes: body.durationMinutes ?? null,
        priceAmount: body.priceAmount ?? 0,
        currency: body.currency ?? "INR",
        prasadText: body.prasadText ?? null,
        priestName: body.priestName ?? null,
        description: body.description ?? null,
        onlineEnabled: body.onlineEnabled ?? true,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      });
      sendSuccess(res, 201, { id: created.id }, "Pooja seva created", "Saved to the temple operational database.");
    })
  );

  r.patch(
    "/pooja-sevas/:id",
    validateBody(sevaPatchSchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updatePoojaSeva(pool, id, req.body as z.infer<typeof sevaPatchSchema>);
      if (!ok) throw new HttpError(404, "Pooja seva not found.", { code: "MASTER_SEVA_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Pooja seva updated", "");
    })
  );

  r.delete(
    "/pooja-sevas/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeletePoojaSeva(pool, id);
      if (!ok) throw new HttpError(404, "Pooja seva not found.", { code: "MASTER_SEVA_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Pooja seva deleted", "");
    })
  );

  // ----- Schedules -----
  r.get(
    "/schedules",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listSchedules(pool) : [];
      sendSuccess(res, 200, { items }, "Schedules loaded", `${items.length} schedule(s) loaded.`);
    })
  );

  r.post(
    "/schedules",
    validateBody(scheduleBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof scheduleBodySchema>;
      const created = await repo.insertSchedule(pool, {
        poojaSevaId: body.poojaSevaId ?? null,
        poojaName: body.poojaName,
        days: body.days,
        timeOfDay: body.timeOfDay ?? null,
        priestName: body.priestName ?? null,
        maxSlots: body.maxSlots ?? null,
        cutoffHours: body.cutoffHours ?? null,
        isActive: body.isActive ?? true,
      });
      sendSuccess(res, 201, { id: created.id }, "Schedule created", "");
    })
  );

  r.delete(
    "/schedules/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteSchedule(pool, id);
      if (!ok) throw new HttpError(404, "Schedule not found.", { code: "MASTER_SCHEDULE_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Schedule deleted", "");
    })
  );

  // ----- Festivals -----
  r.get(
    "/festivals",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listFestivals(pool) : [];
      sendSuccess(res, 200, { items }, "Festivals loaded", `${items.length} festival(s) loaded.`);
    })
  );

  r.post(
    "/festivals",
    validateBody(festivalBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof festivalBodySchema>;
      const created = await repo.insertFestival(pool, {
        name: body.name,
        festivalDate: body.festivalDate ?? null,
        category: body.category ?? "",
        description: body.description ?? null,
        priestName: body.priestName ?? null,
        isActive: body.isActive ?? true,
      });
      sendSuccess(res, 201, { id: created.id }, "Festival created", "");
    })
  );

  r.delete(
    "/festivals/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteFestival(pool, id);
      if (!ok) throw new HttpError(404, "Festival not found.", { code: "MASTER_FESTIVAL_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Festival deleted", "");
    })
  );

  // ----- Panchangam -----
  r.get(
    "/panchangam",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listPanchangam(pool) : [];
      sendSuccess(res, 200, { items }, "Panchangam loaded", `${items.length} entry/entries loaded.`);
    })
  );

  r.post(
    "/panchangam",
    validateBody(panchBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof panchBodySchema>;
      const created = await repo.insertPanchangam(pool, {
        panchDate: body.panchDate,
        festivalLabel: body.festivalLabel ?? null,
        typeLabel: body.typeLabel ?? null,
        auspiciousLabel: body.auspiciousLabel ?? null,
        notes: body.notes ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Panchangam entry created", "");
    })
  );

  r.delete(
    "/panchangam/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeletePanchangam(pool, id);
      if (!ok) throw new HttpError(404, "Panchangam entry not found.", { code: "MASTER_PANCH_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Panchangam entry deleted", "");
    })
  );

  // ----- UOMs -----
  r.get(
    "/uoms",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listUoms(pool) : [];
      sendSuccess(res, 200, { items }, "UOMs loaded", `${items.length} unit(s) loaded.`);
    })
  );

  r.post(
    "/uoms",
    validateBody(uomBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof uomBodySchema>;
      const created = await repo.insertUom(pool, {
        kind: body.kind,
        name: body.name,
        abbreviation: body.abbreviation,
        typeLabel: body.typeLabel ?? "Unit (count)",
        baseUnitId: body.baseUnitId ?? null,
        quantityPerBulk: body.quantityPerBulk ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "UOM created", "");
    })
  );

  r.patch(
    "/uoms/:id",
    validateBody(uomPatchSchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateUom(pool, id, req.body as z.infer<typeof uomPatchSchema>);
      if (!ok) throw new HttpError(404, "UOM not found.", { code: "MASTER_UOM_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "UOM updated", "");
    })
  );

  r.delete(
    "/uoms/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteUom(pool, id);
      if (!ok) throw new HttpError(404, "UOM not found.", { code: "MASTER_UOM_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "UOM deleted", "");
    })
  );

  return r;
}
