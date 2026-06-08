import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as repo from "./extended-modules.repository.js";
import * as ops from "./operations.repository.js";
import { optionalQueryString, routeParam } from "./route-helpers.js";

const categoryBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const prasadItemBody = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(60).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  priceAmount: z.number().nonnegative(),
  currency: z.string().max(8).optional().default("INR"),
  includedItems: z.array(z.string()).optional().default([]),
  status: z.enum(["available", "unavailable"]).optional().default("available"),
  emoji: z.string().max(16).nullable().optional(),
});

const assetBody = z.object({
  assetType: z.enum(["jewellery", "land", "metal", "equipment"]),
  name: z.string().min(1).max(300),
  code: z.string().max(60).nullable().optional(),
  valueAmount: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).optional().default("INR"),
  weightOrArea: z.string().max(120).nullable().optional(),
  acquiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.string().max(60).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const publicSiteBody = z.object({
  title: z.string().max(200).nullable().optional(),
  content: z.record(z.string(), z.unknown()).optional().default({}),
});

export function createTemplePrasadRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/categories",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listPrasadCategories(pool) : [];
      sendSuccess(res, 200, { items }, "Categories loaded", "");
    })
  );

  r.post(
    "/categories",
    validateBody(categoryBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof categoryBody>;
      const created = await repo.insertPrasadCategory(pool, {
        name: body.name,
        description: body.description ?? null,
        sortOrder: body.sortOrder,
      });
      sendSuccess(res, 201, { id: created.id }, "Category created", "");
    })
  );

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const search = optionalQueryString(req.query.search);
      const items = pool ? await repo.listPrasadItems(pool, search) : [];
      sendSuccess(res, 200, { items }, "Prasad items loaded", "");
    })
  );

  r.post(
    "/",
    validateBody(prasadItemBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof prasadItemBody>;
      const created = await repo.insertPrasadItem(pool, {
        name: body.name,
        sku: body.sku ?? null,
        categoryId: body.categoryId ?? null,
        priceAmount: body.priceAmount,
        currency: body.currency ?? "INR",
        includedItems: body.includedItems ?? [],
        status: body.status ?? "available",
        emoji: body.emoji ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Prasad item created", "");
    })
  );

  r.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeletePrasadItem(pool, id);
      if (!ok) throw new HttpError(404, "Item not found.", { code: "NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Item deleted", "");
    })
  );

  return r;
}

export function createTempleFinanceAssetsRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const assetType = optionalQueryString(req.query.assetType);
      const items = pool ? await repo.listFinanceAssets(pool, assetType ?? undefined) : [];
      sendSuccess(res, 200, { items }, "Assets loaded", "");
    })
  );

  r.post(
    "/",
    validateBody(assetBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof assetBody>;
      const created = await repo.insertFinanceAsset(pool, {
        assetType: body.assetType,
        name: body.name,
        code: body.code ?? null,
        valueAmount: body.valueAmount ?? null,
        currency: body.currency ?? "INR",
        weightOrArea: body.weightOrArea ?? null,
        acquiredDate: body.acquiredDate ?? null,
        status: body.status ?? null,
        notes: body.notes ?? null,
      });
      sendSuccess(res, 201, { id: created.id }, "Asset created", "");
    })
  );

  r.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteFinanceAsset(pool, id);
      if (!ok) throw new HttpError(404, "Asset not found.", { code: "NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Asset deleted", "");
    })
  );

  return r;
}

export function createTemplePublicSiteRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listPublicSitePages(pool) : [];
      sendSuccess(res, 200, { items }, "Public site pages loaded", "");
    })
  );

  r.get(
    "/:pageKey",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const pageKey = routeParam(req.params.pageKey);
      const page = await repo.getPublicSitePage(pool, pageKey);
      sendSuccess(res, 200, { page: page ?? { page_key: pageKey, title: null, content: {}, updated_at: null } }, "Page loaded", "");
    })
  );

  r.put(
    "/:pageKey",
    validateBody(publicSiteBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const pageKey = routeParam(req.params.pageKey);
      const body = req.body as z.infer<typeof publicSiteBody>;
      await repo.upsertPublicSitePage(pool, {
        pageKey,
        title: body.title ?? null,
        content: body.content ?? {},
      });
      sendSuccess(res, 200, { pageKey }, "Page saved", "");
    })
  );

  return r;
}

export function createTempleKioskRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.get(
    "/dashboard",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      if (!pool) {
        sendSuccess(res, 200, { terminals: [], recentTransactions: [], stats: {} }, "Kiosk dashboard", "");
        return;
      }

      const terminals = await pool.query<{ id: string; name: string; status: string; location: string | null }>(
        `SELECT id::text, name, status, location FROM kiosk_terminals ORDER BY created_at DESC`
      );

      const donations = await ops.listDonations(pool, 10);
      const recentTransactions = donations.map((d) => ({
        id: d.receipt_number,
        time: d.occurred_at,
        devotee: d.donor_name ?? "Anonymous",
        item: d.category ?? "Donation",
        amount: `${d.currency} ${d.amount}`,
        status: "Recorded",
      }));

      sendSuccess(
        res,
        200,
        {
          terminals: terminals.rows,
          recentTransactions,
          stats: {
            terminalCount: terminals.rows.length,
            onlineCount: terminals.rows.filter((t) => t.status === "online").length,
            todayTransactions: recentTransactions.length,
          },
        },
        "Kiosk dashboard loaded",
        ""
      );
    })
  );

  return r;
}

const printLabelsBody = z.object({
  productIds: z.array(z.string()).min(1),
  labelType: z.enum(["barcode", "qr"]).optional().default("barcode"),
});

export function createTempleInventoryPrintRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  r.post(
    "/labels",
    validateBody(printLabelsBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof printLabelsBody>;
      const ids = body.productIds.map((id) => Number(id)).filter((n) => Number.isFinite(n));
      const { rows } = await pool.query<{
        id: string;
        name: string;
        sku: string | null;
      }>(
        `SELECT id::text, name, sku
         FROM inventory_products
         WHERE id = ANY($1::bigint[]) AND deleted_at IS NULL`,
        [ids]
      );

      const labels = rows.map((p) => ({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.sku ?? p.id,
        qrPayload: p.sku ?? p.id,
        labelType: body.labelType,
      }));

      sendSuccess(res, 200, { labels }, "Print labels generated", `${labels.length} label(s).`);
    })
  );

  return r;
}
