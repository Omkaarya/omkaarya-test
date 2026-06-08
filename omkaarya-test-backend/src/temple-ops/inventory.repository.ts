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
  category_id: string | null;
  supplier_id: string | null;
  default_store_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function listInventoryProducts(pool: Pool): Promise<InventoryProductRow[]> {
  const { rows } = await pool.query<InventoryProductRow>(
    `SELECT id::text AS id, sku, name, category, sub_category, product_type,
            quantity::text AS quantity, reorder_point::text AS reorder_point,
            unit, cost_amount::text AS cost_amount,
            supplier_name, image_url,
            category_id::text AS category_id,
            supplier_id::text AS supplier_id,
            default_store_id::text AS default_store_id,
            created_at, updated_at
       FROM inventory_products
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getInventoryProduct(pool: Pool, id: string): Promise<InventoryProductRow | null> {
  const { rows } = await pool.query<InventoryProductRow>(
    `SELECT id::text AS id, sku, name, category, sub_category, product_type,
            quantity::text AS quantity, reorder_point::text AS reorder_point,
            unit, cost_amount::text AS cost_amount,
            supplier_name, image_url,
            category_id::text AS category_id,
            supplier_id::text AS supplier_id,
            default_store_id::text AS default_store_id,
            created_at, updated_at
       FROM inventory_products
      WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] ?? null;
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
  categoryId?: string | null;
  supplierId?: string | null;
  defaultStoreId?: string | null;
};

export async function insertInventoryProduct(pool: Pool, input: InsertInventoryProductInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO inventory_products (
       sku, name, category, sub_category, product_type,
       quantity, reorder_point, unit, cost_amount,
       supplier_name, image_url, category_id, supplier_id, default_store_id
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, $11, $12, $13, $14
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
      input.categoryId ?? null,
      input.supplierId ?? null,
      input.defaultStoreId ?? null,
    ]
  );
  return { id: rows[0]!.id };
}

export type UpdateInventoryProductInput = Partial<InsertInventoryProductInput>;

export async function updateInventoryProduct(pool: Pool, id: string, input: UpdateInventoryProductInput): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const map: Array<[keyof UpdateInventoryProductInput, string, () => unknown]> = [
    ["sku", "sku", () => input.sku?.trim()],
    ["name", "name", () => input.name?.trim()],
    ["category", "category", () => input.category?.trim()],
    ["subCategory", "sub_category", () => input.subCategory?.trim()],
    ["productType", "product_type", () => input.productType?.trim()],
    ["quantity", "quantity", () => input.quantity],
    ["reorderPoint", "reorder_point", () => input.reorderPoint],
    ["unit", "unit", () => input.unit?.trim()],
    ["costAmount", "cost_amount", () => input.costAmount],
    ["supplierName", "supplier_name", () => input.supplierName?.trim() ?? null],
    ["imageUrl", "image_url", () => input.imageUrl?.trim() ?? null],
    ["categoryId", "category_id", () => input.categoryId ?? null],
    ["supplierId", "supplier_id", () => input.supplierId ?? null],
    ["defaultStoreId", "default_store_id", () => input.defaultStoreId ?? null],
  ];
  for (const [key, col, val] of map) {
    if (input[key] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val());
    }
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(
    `UPDATE inventory_products SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`,
    params
  );
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteInventoryProduct(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE inventory_products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

/**
 * Adjusts product quantity within a single transaction and writes a stock_ledger row.
 * Returns the new quantity, or null if the product is not found / soft-deleted.
 */
export async function adjustProductStock(
  pool: Pool,
  input: {
    productId: string;
    delta: number;
    movementKind:
      | "adjustment"
      | "transfer_in"
      | "transfer_out"
      | "return"
      | "purchase_in"
      | "sale_out"
      | "consumption"
      | "open_balance"
      | "wastage";
    storeId?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
    reason?: string | null;
    createdBy?: string | null;
  }
): Promise<{ newQuantity: number } | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ quantity: string }>(
      `UPDATE inventory_products
          SET quantity = quantity + $2, updated_at = NOW()
        WHERE id = $1
          AND deleted_at IS NULL
          AND ($2 >= 0 OR quantity >= ABS($2))
        RETURNING quantity::text AS quantity`,
      [input.productId, input.delta]
    );
    const updated = rows[0];
    if (!updated) {
      await client.query("ROLLBACK");
      return null;
    }
    await client.query(
      `INSERT INTO inventory_stock_ledger (
         product_id, movement_kind, quantity_delta, store_id, reference_type, reference_id, reason, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.productId,
        input.movementKind,
        input.delta,
        input.storeId ?? null,
        input.referenceType ?? null,
        input.referenceId ?? null,
        input.reason ?? null,
        input.createdBy ?? null,
      ]
    );
    await client.query("COMMIT");
    return { newQuantity: Number(updated.quantity) };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export type StockLedgerRow = {
  id: string;
  product_id: string;
  product_name: string | null;
  movement_kind: string;
  quantity_delta: string;
  store_id: string | null;
  reference_type: string | null;
  reference_id: string | null;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export async function listStockLedger(
  pool: Pool,
  filters: { productId?: string; limit?: number } = {}
): Promise<StockLedgerRow[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (filters.productId) {
    conds.push(`l.product_id = $${i++}`);
    params.push(filters.productId);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const limit = filters.limit && filters.limit > 0 && filters.limit <= 500 ? filters.limit : 200;
  const { rows } = await pool.query<StockLedgerRow>(
    `SELECT l.id::text AS id, l.product_id::text AS product_id, p.name AS product_name,
            l.movement_kind, l.quantity_delta::text AS quantity_delta,
            l.store_id::text AS store_id, l.reference_type, l.reference_id, l.reason,
            l.created_by, l.created_at::text AS created_at
       FROM inventory_stock_ledger l
       LEFT JOIN inventory_products p ON p.id = l.product_id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT ${limit}`,
    params
  );
  return rows;
}
