import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import { getTenantPoolOrNull, requireTenantPool } from "./helpers.js";
import * as repo from "./inventory-ecosystem.repository.js";
import { routeParam } from "./route-helpers.js";

// ── Categories ─────────────────────────────────────────────────────────

const categoryBody = z.object({
  name: z.string().min(1).max(200),
  parentId: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

const categoryPatch = categoryBody.partial();

export function createTempleInventoryEcosystemRouter(): Router {
  const r = Router();
  r.use(requireTempleJwtSession);

  // Categories
  r.get(
    "/categories",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listCategories(pool) : [];
      sendSuccess(res, 200, { items }, "Categories loaded", `${items.length} categories.`);
    })
  );

  r.post(
    "/categories",
    validateBody(categoryBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof categoryBody>;
      const created = await repo.insertCategory(pool, {
        name: body.name,
        parentId: body.parentId ?? null,
        description: body.description ?? null,
        sortOrder: body.sortOrder ?? 0,
      });
      sendSuccess(res, 201, { id: created.id }, "Category created", "");
    })
  );

  r.patch(
    "/categories/:id",
    validateBody(categoryPatch),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateCategory(pool, id, req.body as z.infer<typeof categoryPatch>);
      if (!ok) throw new HttpError(404, "Category not found.", { code: "CATEGORY_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Category updated", "");
    })
  );

  r.delete(
    "/categories/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteCategory(pool, id);
      if (!ok) throw new HttpError(404, "Category not found.", { code: "CATEGORY_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Category deleted", "");
    })
  );

  // Suppliers
  const supplierBody = z.object({
    name: z.string().min(1).max(300),
    contactPerson: z.string().max(200).nullable().optional(),
    email: z.string().email().max(200).nullable().optional().or(z.literal("")),
    phone: z.string().max(60).nullable().optional(),
    address: z.string().max(1000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    paymentTerms: z.string().max(200).nullable().optional(),
    isActive: z.boolean().optional().default(true),
  });
  const supplierPatch = supplierBody.partial();

  r.get(
    "/suppliers",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listSuppliers(pool) : [];
      sendSuccess(res, 200, { items }, "Suppliers loaded", `${items.length} suppliers.`);
    })
  );

  r.post(
    "/suppliers",
    validateBody(supplierBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof supplierBody>;
      const created = await repo.insertSupplier(pool, {
        name: body.name,
        contactPerson: body.contactPerson ?? null,
        email: typeof body.email === "string" && body.email.length > 0 ? body.email : null,
        phone: body.phone ?? null,
        address: body.address ?? null,
        notes: body.notes ?? null,
        paymentTerms: body.paymentTerms ?? null,
        isActive: body.isActive ?? true,
      });
      sendSuccess(res, 201, { id: created.id }, "Supplier created", "");
    })
  );

  r.patch(
    "/suppliers/:id",
    validateBody(supplierPatch),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof supplierPatch>;
      const ok = await repo.updateSupplier(pool, id, {
        ...body,
        email: body.email === "" ? null : body.email ?? undefined,
      } as never);
      if (!ok) throw new HttpError(404, "Supplier not found.", { code: "SUPPLIER_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Supplier updated", "");
    })
  );

  r.delete(
    "/suppliers/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteSupplier(pool, id);
      if (!ok) throw new HttpError(404, "Supplier not found.", { code: "SUPPLIER_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Supplier deleted", "");
    })
  );

  // Stores
  const storeBody = z.object({
    code: z.string().min(1).max(60),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).nullable().optional(),
    isActive: z.boolean().optional().default(true),
  });
  const storePatch = storeBody.partial();

  r.get(
    "/stores",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listStores(pool) : [];
      sendSuccess(res, 200, { items }, "Stores loaded", `${items.length} stores.`);
    })
  );

  r.post(
    "/stores",
    validateBody(storeBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof storeBody>;
      const created = await repo.insertStore(pool, {
        code: body.code,
        name: body.name,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
      });
      sendSuccess(res, 201, { id: created.id }, "Store created", "");
    })
  );

  r.patch(
    "/stores/:id",
    validateBody(storePatch),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.updateStore(pool, id, req.body as z.infer<typeof storePatch>);
      if (!ok) throw new HttpError(404, "Store not found.", { code: "STORE_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Store updated", "");
    })
  );

  r.delete(
    "/stores/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteStore(pool, id);
      if (!ok) throw new HttpError(404, "Store not found.", { code: "STORE_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "Store deleted", "");
    })
  );

  // Transfers
  const transferBody = z.object({
    reference: z.string().min(1).max(120),
    fromStoreId: z.string().nullable().optional(),
    toStoreId: z.string().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    lines: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().positive(),
        })
      )
      .min(1),
  });
  const transferActionBody = z.object({
    action: z.enum(["dispatch", "receive", "cancel"]),
  });

  r.get(
    "/transfers",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listTransfers(pool) : [];
      sendSuccess(res, 200, { items }, "Transfers loaded", `${items.length} transfers.`);
    })
  );

  r.get(
    "/transfers/:id/lines",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const id = routeParam(req.params.id);
      const items = pool ? await repo.getTransferLines(pool, id) : [];
      sendSuccess(res, 200, { items }, "Transfer lines loaded", "");
    })
  );

  r.post(
    "/transfers",
    validateBody(transferBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof transferBody>;
      const created = await repo.createTransfer(pool, {
        reference: body.reference,
        fromStoreId: body.fromStoreId ?? null,
        toStoreId: body.toStoreId ?? null,
        notes: body.notes ?? null,
        lines: body.lines,
      });
      sendSuccess(res, 201, { id: created.id }, "Transfer created", "");
    })
  );

  r.post(
    "/transfers/:id/transition",
    validateBody(transferActionBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const body = req.body as z.infer<typeof transferActionBody>;
      const target = body.action === "dispatch" ? "dispatched" : body.action === "receive" ? "received" : "cancelled";
      const ok = await repo.advanceTransfer(pool, id, target);
      if (!ok) {
        throw new HttpError(409, "Transfer cannot be advanced from its current state.", {
          code: "TRANSFER_INVALID_TRANSITION",
        });
      }
      sendSuccess(res, 200, { id, status: target }, "Transfer updated", "");
    })
  );

  // Purchase Orders
  const poBody = z.object({
    poNumber: z.string().min(1).max(120),
    supplierId: z.string().nullable().optional(),
    expectedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    currency: z.string().max(8).optional().default("INR"),
    notes: z.string().max(2000).nullable().optional(),
    lines: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().positive(),
          unitCost: z.number().nonnegative(),
        })
      )
      .min(1),
  });

  r.get(
    "/purchase-orders",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listPurchaseOrders(pool) : [];
      sendSuccess(res, 200, { items }, "Purchase orders loaded", `${items.length} POs.`);
    })
  );

  r.get(
    "/purchase-orders/:id/lines",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const id = routeParam(req.params.id);
      const items = pool ? await repo.getPurchaseOrderLines(pool, id) : [];
      sendSuccess(res, 200, { items }, "PO lines loaded", "");
    })
  );

  r.post(
    "/purchase-orders",
    validateBody(poBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof poBody>;
      const created = await repo.createPurchaseOrder(pool, {
        poNumber: body.poNumber,
        supplierId: body.supplierId ?? null,
        expectedAt: body.expectedAt ?? null,
        currency: body.currency ?? "INR",
        notes: body.notes ?? null,
        lines: body.lines,
      });
      sendSuccess(res, 201, { id: created.id }, "Purchase order created", "");
    })
  );

  r.post(
    "/purchase-orders/:id/receive",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.receivePurchaseOrder(pool, id);
      if (!ok) {
        throw new HttpError(409, "Purchase order cannot be received.", {
          code: "PURCHASE_ORDER_RECEIVE_INVALID",
        });
      }
      sendSuccess(res, 200, { id }, "Purchase order received", "");
    })
  );

  // BOM
  const bomBody = z.object({
    name: z.string().min(1).max(200),
    poojaSevaId: z.string().nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    isActive: z.boolean().optional().default(true),
    lines: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().positive(),
          isOptional: z.boolean().optional().default(false),
          notes: z.string().max(500).nullable().optional(),
        })
      )
      .min(1),
  });

  r.get(
    "/boms",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listBoms(pool) : [];
      sendSuccess(res, 200, { items }, "BOMs loaded", `${items.length} BOMs.`);
    })
  );

  r.get(
    "/boms/:id/lines",
    asyncHandler(async (req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const id = routeParam(req.params.id);
      const items = pool ? await repo.getBomLines(pool, id) : [];
      sendSuccess(res, 200, { items }, "BOM lines loaded", "");
    })
  );

  r.post(
    "/boms",
    validateBody(bomBody),
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const body = req.body as z.infer<typeof bomBody>;
      const created = await repo.createBom(pool, {
        name: body.name,
        poojaSevaId: body.poojaSevaId ?? null,
        description: body.description ?? null,
        isActive: body.isActive ?? true,
        lines: body.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          isOptional: l.isOptional ?? false,
          notes: l.notes ?? null,
        })),
      });
      sendSuccess(res, 201, { id: created.id }, "BOM created", "");
    })
  );

  r.delete(
    "/boms/:id",
    asyncHandler(async (req, res) => {
      const pool = await requireTenantPool(res);
      const id = routeParam(req.params.id);
      const ok = await repo.softDeleteBom(pool, id);
      if (!ok) throw new HttpError(404, "BOM not found.", { code: "BOM_NOT_FOUND" });
      sendSuccess(res, 200, { id }, "BOM deleted", "");
    })
  );

  // Reorder / Low stock
  r.get(
    "/low-stock",
    asyncHandler(async (_req, res) => {
      const pool = await getTenantPoolOrNull(res);
      const items = pool ? await repo.listLowStockProducts(pool) : [];
      sendSuccess(res, 200, { items }, "Low stock loaded", `${items.length} item(s) need attention.`);
    })
  );

  return r;
}
