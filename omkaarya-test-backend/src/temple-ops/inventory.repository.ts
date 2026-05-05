import type { Pool } from "pg";

export type InventoryProductRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  sub_category: string;
  product_type: string;
  quantity: string;
  reorder_point: string | null;
  unit: string;
  cost_amount: string;
  supplier_name: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function listInventoryProducts(pool: Pool): Promise<InventoryProductRow[]> {
  const { rows } = await pool.query<InventoryProductRow>(
    `SELECT id::text AS id, sku, name, category, sub_category, product_type,
            quantity::text AS quantity, reorder_point::text AS reorder_point,
            unit, cost_amount::text AS cost_amount,
            supplier_name, image_url, created_at, updated_at
       FROM inventory_products
      WHERE deleted_at IS NULL
      ORDER BY name ASC`
  );
  return rows;
}

export type InsertInventoryProductInput = {
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
};

export async function insertInventoryProduct(pool: Pool, input: InsertInventoryProductInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO inventory_products (
       sku, name, category, sub_category, product_type,
       quantity, reorder_point, unit, cost_amount,
       supplier_name, image_url
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, $11
     )
     RETURNING id::text AS id`,
    [
      input.sku.trim(),
      input.name.trim(),
      input.category.trim(),
      input.subCategory.trim(),
      input.productType.trim(),
      input.quantity,
      input.reorderPoint,
      input.unit.trim(),
      input.costAmount,
      input.supplierName?.trim() ?? null,
      input.imageUrl?.trim() ?? null,
    ]
  );
  return { id: rows[0]!.id };
}
