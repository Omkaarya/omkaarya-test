import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { InventoryService } from "./inventory.service.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as repo from "./inventory.repository.js";
import { optionalQueryString, positiveQueryInt, routeParam } from "./route-helpers.js";

const createProductBodySchema = z.object({
  sku: z.string().min(1).max(120),
  name: z.string().min(1).max(500),
  category: z.string().max(200).optional().default(""),
  subCategory: z.string().max(200).optional().default(""),
  productType: z.string().max(120).optional().default(""),
  quantity: z.number().nonnegative(),
  reorderPoint: z.number().nonnegative().nullable().optional(),
  unit: z.string().max(80).optional().default(""),
  costAmount: z.number().nonnegative().optional().default(0),
  supplierName: z.string().max(300).nullable().optional(),
  imageUrl: z.string().max(2000).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),
  defaultStoreId: z.string().nullable().optional(),
});

const updateProductBodySchema = createProductBodySchema.partial();

const adjustStockBodySchema = z.object({
  delta: z.number().refine((n) => n !== 0, "Delta must be non-zero"),
  movementKind: z.enum([
    "adjustment", "transfer_in", "transfer_out", "return",
    "purchase_in", "sale_out", "consumption", "open_balance", "wastage",
  ]).optional().default("adjustment"),
  storeId: z.string().nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
});

export function createTempleInventoryRouter(): Router {
  const r = Router();

  r.use(requireTempleJwtSession);

  r.get(
    "/products",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const service = new InventoryService(async () => pool);
      const products = await service.listProducts();
      sendSuccess(
        res,
        200,
        { products },
        "Inventory loaded",
        products.length
          ? `${products.length} product(s) loaded from the temple operational database.`
          : "No products yet, or the temple operational database is not configured / migrated."
      );
    })
  );

  r.post(
    "/products",
    validateBody(createProductBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof createProductBodySchema>;
      const service = new InventoryService(async () => pool);
      const created = await service.createProduct({
        sku: body.sku,
        name: body.name,
        category: body.category ?? "",
        subCategory: body.subCategory ?? "",
        productType: body.productType ?? "",
        quantity: body.quantity,
        reorderPoint: body.reorderPoint ?? null,
        unit: body.unit ?? "",
        costAmount: body.costAmount ?? 0,
        supplierName: body.supplierName ?? null,
        imageUrl: body.imageUrl ?? null,
        categoryId: body.categoryId ?? null,
        supplierId: body.supplierId ?? null,
        defaultStoreId: body.defaultStoreId ?? null,
      });

      if (!created) {
        throw new HttpError(500, "Could not create product.", {
          code: "INVENTORY_CREATE_FAILED",
          reason: "Insert did not return an id.",
        });
      }

      sendSuccess(res, 201, { id: created.id }, "Product created", "The product was stored in the temple operational database.");
    })
  );

  r.patch(
    "/products/:id",
    validateBody(updateProductBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateInventoryProduct(pool, id, req.body as z.infer<typeof updateProductBodySchema>);
      if (!ok) throw new HttpError(404, "Product not found.", { code: "INVENTORY_PRODUCT_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Product updated", "");
    })
  );

  r.delete(
    "/products/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteInventoryProduct(pool, id);
      if (!ok) throw new HttpError(404, "Product not found.", { code: "INVENTORY_PRODUCT_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Product deleted", "");
    })
  );

  r.post(
    "/products/:id/adjust",
    validateBody(adjustStockBodySchema),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof adjustStockBodySchema>;
      const result = await repo.adjustProductStock(pool, {
        productId: id,
        delta: body.delta,
        movementKind: body.movementKind,
        storeId: body.storeId ?? null,
        reason: body.reason ?? null,
        referenceType: "manual_adjustment",
      });
      if (!result) {
        throw new HttpError(404, "Product not found.", { code: "INVENTORY_PRODUCT_NOT_FOUND" });
      }
      sendSuccess(res, 200, { newQuantity: result.newQuantity }, "Stock adjusted", "");
    })
  );

  r.get(
    "/stock-ledger",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const productId = optionalQueryString(req.query.productId);
      const limit = positiveQueryInt(req.query.limit);
      const items = pool ? await repo.listStockLedger(pool, { productId, limit }) : [];
      sendSuccess(res, 200, { items }, "Ledger loaded", `${items.length} ledger entries.`);
    })
  );

  return r;
}
