import { Router, type Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import { validateBody } from "../middleware/validate.js";
import { getOperationalPoolForTenant } from "../db/temple-operational-pool-registry.js";
import { requireTempleJwtSession } from "./middleware/require-temple-jwt.js";
import type { TempleSessionLocals } from "./middleware/require-temple-jwt.js";
import { InventoryService } from "./inventory.service.js";

function templeSession(res: Response): TempleSessionLocals {
  return (res.locals as { templeSession?: TempleSessionLocals }).templeSession!;
}

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
});

export function createTempleInventoryRouter(): Router {
  const r = Router();

  r.use(requireTempleJwtSession);

  r.get(
    "/products",
    asyncHandler(async (_req, res) => {
      const tenantId = templeSession(res).tenantId;
      const service = new InventoryService(() => getOperationalPoolForTenant(tenantId));
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
      const tenantId = templeSession(res).tenantId;
      const pool = await getOperationalPoolForTenant(tenantId);
      if (!pool) {
        throw new HttpError(
          503,
          "Temple operational database is not configured for this tenant.",
          {
            code: "TEMPLE_OPS_DB_MISSING",
            reason: "Set temples.operational_db_name (or operational_database_url) and TEMPLE_OPS_DB_* / run temple-ops migrations.",
          }
        );
      }

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

  return r;
}
