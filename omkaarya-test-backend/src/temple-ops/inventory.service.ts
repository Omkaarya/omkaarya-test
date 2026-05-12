import type { Pool } from "pg";
import type { InsertInventoryProductInput, InventoryProductRow, UpdateInventoryProductInput } from "./inventory.repository.js";
import * as repo from "./inventory.repository.js";

export type InventoryProductDto = {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  productType: string;
  quantity: number;
  reorderPoint: number | null;
  unit: string;
  costAmount: number;
  supplierName: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  supplierId: string | null;
  defaultStoreId: string | null;
  status: "ok" | "low" | "out";
};

function toNumber(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function deriveStatus(quantity: number, reorderPoint: number | null): "ok" | "low" | "out" {
  if (quantity <= 0) return "out";
  if (reorderPoint != null && reorderPoint > 0 && quantity <= reorderPoint) return "low";
  return "ok";
}

function mapRow(r: InventoryProductRow): InventoryProductDto {
  const quantity = toNumber(r.quantity);
  const reorderPoint = r.reorder_point == null || r.reorder_point === "" ? null : toNumber(r.reorder_point);
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    category: r.category,
    subCategory: r.sub_category,
    productType: r.product_type,
    quantity,
    reorderPoint,
    unit: r.unit,
    costAmount: toNumber(r.cost_amount),
    supplierName: r.supplier_name,
    imageUrl: r.image_url,
    categoryId: r.category_id,
    supplierId: r.supplier_id,
    defaultStoreId: r.default_store_id,
    status: deriveStatus(quantity, reorderPoint),
  };
}

export class InventoryService {
  constructor(private readonly getPool: () => Promise<Pool | null>) {}

  async listProducts(): Promise<InventoryProductDto[]> {
    const pool = await this.getPool();
    if (!pool) return [];
    const rows = await repo.listInventoryProducts(pool);
    return rows.map(mapRow);
  }

  async createProduct(input: InsertInventoryProductInput): Promise<{ id: string } | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    return repo.insertInventoryProduct(pool, input);
  }

  async updateProduct(id: string, input: UpdateInventoryProductInput): Promise<boolean | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    return repo.updateInventoryProduct(pool, id, input);
  }

  async deleteProduct(id: string): Promise<boolean | null> {
    const pool = await this.getPool();
    if (!pool) return null;
    return repo.softDeleteInventoryProduct(pool, id);
  }
}
