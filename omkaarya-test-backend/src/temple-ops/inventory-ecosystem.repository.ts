import type { Pool, PoolClient } from "pg";

// ── Categories ─────────────────────────────────────────────────────────

export type CategoryRow = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
};

export async function listCategories(pool: Pool): Promise<CategoryRow[]> {
  const { rows } = await pool.query<CategoryRow>(
    `SELECT id::text AS id, name, parent_id::text AS parent_id, description, sort_order
       FROM inventory_categories
      WHERE deleted_at IS NULL
      ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}

export async function insertCategory(
  pool: Pool,
  input: { name: string; parentId: string | null; description: string | null; sortOrder: number }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO inventory_categories (name, parent_id, description, sort_order)
     VALUES ($1, $2, $3, $4) RETURNING id::text AS id`,
    [input.name.trim(), input.parentId, input.description?.trim() || null, input.sortOrder]
  );
  return { id: rows[0]!.id };
}

export async function updateCategory(
  pool: Pool,
  id: string,
  input: Partial<{ name: string; parentId: string | null; description: string | null; sortOrder: number }>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (input.name !== undefined) { sets.push(`name = $${i++}`); params.push(input.name.trim()); }
  if (input.parentId !== undefined) { sets.push(`parent_id = $${i++}`); params.push(input.parentId); }
  if (input.description !== undefined) { sets.push(`description = $${i++}`); params.push(input.description?.trim() || null); }
  if (input.sortOrder !== undefined) { sets.push(`sort_order = $${i++}`); params.push(input.sortOrder); }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(`UPDATE inventory_categories SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`, params);
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteCategory(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE inventory_categories SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ── Suppliers ──────────────────────────────────────────────────────────

export type SupplierRow = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  payment_terms: string | null;
  is_active: boolean;
};

export async function listSuppliers(pool: Pool): Promise<SupplierRow[]> {
  const { rows } = await pool.query<SupplierRow>(
    `SELECT id::text AS id, name, contact_person, email, phone, address, notes, payment_terms, is_active
       FROM inventory_suppliers
      WHERE deleted_at IS NULL
      ORDER BY name ASC`
  );
  return rows;
}

export type InsertSupplierInput = {
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  paymentTerms: string | null;
  isActive: boolean;
};

export async function insertSupplier(pool: Pool, input: InsertSupplierInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO inventory_suppliers (name, contact_person, email, phone, address, notes, payment_terms, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id::text AS id`,
    [
      input.name.trim(),
      input.contactPerson?.trim() || null,
      input.email?.trim() || null,
      input.phone?.trim() || null,
      input.address?.trim() || null,
      input.notes?.trim() || null,
      input.paymentTerms?.trim() || null,
      input.isActive,
    ]
  );
  return { id: rows[0]!.id };
}

export async function updateSupplier(
  pool: Pool,
  id: string,
  input: Partial<InsertSupplierInput>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const map: Array<[keyof InsertSupplierInput, string, () => unknown]> = [
    ["name", "name", () => input.name?.trim()],
    ["contactPerson", "contact_person", () => input.contactPerson?.trim() || null],
    ["email", "email", () => input.email?.trim() || null],
    ["phone", "phone", () => input.phone?.trim() || null],
    ["address", "address", () => input.address?.trim() || null],
    ["notes", "notes", () => input.notes?.trim() || null],
    ["paymentTerms", "payment_terms", () => input.paymentTerms?.trim() || null],
    ["isActive", "is_active", () => input.isActive],
  ];
  for (const [k, col, val] of map) {
    if (input[k] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val());
    }
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(`UPDATE inventory_suppliers SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`, params);
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteSupplier(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE inventory_suppliers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ── Store Locations ────────────────────────────────────────────────────

export type StoreRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export async function listStores(pool: Pool): Promise<StoreRow[]> {
  const { rows } = await pool.query<StoreRow>(
    `SELECT id::text AS id, code, name, description, is_active
       FROM inventory_store_locations
      WHERE deleted_at IS NULL
      ORDER BY name ASC`
  );
  return rows;
}

export async function insertStore(
  pool: Pool,
  input: { code: string; name: string; description: string | null; isActive: boolean }
): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO inventory_store_locations (code, name, description, is_active)
     VALUES ($1,$2,$3,$4) RETURNING id::text AS id`,
    [input.code.trim(), input.name.trim(), input.description?.trim() || null, input.isActive]
  );
  return { id: rows[0]!.id };
}

export async function updateStore(
  pool: Pool,
  id: string,
  input: Partial<{ code: string; name: string; description: string | null; isActive: boolean }>
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  if (input.code !== undefined) { sets.push(`code = $${i++}`); params.push(input.code.trim()); }
  if (input.name !== undefined) { sets.push(`name = $${i++}`); params.push(input.name.trim()); }
  if (input.description !== undefined) { sets.push(`description = $${i++}`); params.push(input.description?.trim() || null); }
  if (input.isActive !== undefined) { sets.push(`is_active = $${i++}`); params.push(input.isActive); }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(`UPDATE inventory_store_locations SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`, params);
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteStore(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE inventory_store_locations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ── Transfers ──────────────────────────────────────────────────────────

export type TransferRow = {
  id: string;
  reference: string;
  from_store_id: string | null;
  to_store_id: string | null;
  from_store_name: string | null;
  to_store_name: string | null;
  status: "draft" | "dispatched" | "received" | "cancelled";
  dispatched_at: string | null;
  received_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
};

export type TransferLine = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
};

export async function listTransfers(pool: Pool): Promise<TransferRow[]> {
  const { rows } = await pool.query<TransferRow>(
    `SELECT t.id::text AS id, t.reference,
            t.from_store_id::text AS from_store_id, t.to_store_id::text AS to_store_id,
            sf.name AS from_store_name, st.name AS to_store_name,
            t.status,
            t.dispatched_at::text AS dispatched_at,
            t.received_at::text AS received_at,
            t.cancelled_at::text AS cancelled_at,
            t.notes, t.created_at::text AS created_at
       FROM inventory_transfers t
       LEFT JOIN inventory_store_locations sf ON sf.id = t.from_store_id
       LEFT JOIN inventory_store_locations st ON st.id = t.to_store_id
      ORDER BY t.created_at DESC`
  );
  return rows;
}

export async function getTransferLines(pool: Pool, transferId: string): Promise<TransferLine[]> {
  const { rows } = await pool.query<TransferLine>(
    `SELECT l.id::text AS id, l.product_id::text AS product_id, p.name AS product_name,
            l.quantity::text AS quantity
       FROM inventory_transfer_lines l
       LEFT JOIN inventory_products p ON p.id = l.product_id
      WHERE l.transfer_id = $1
      ORDER BY l.id ASC`,
    [transferId]
  );
  return rows;
}

export async function createTransfer(
  pool: Pool,
  input: {
    reference: string;
    fromStoreId: string | null;
    toStoreId: string | null;
    notes: string | null;
    lines: Array<{ productId: string; quantity: number }>;
  }
): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO inventory_transfers (reference, from_store_id, to_store_id, status, notes)
       VALUES ($1,$2,$3,'draft',$4)
       RETURNING id::text AS id`,
      [input.reference.trim(), input.fromStoreId, input.toStoreId, input.notes?.trim() || null]
    );
    const id = rows[0]!.id;
    for (const ln of input.lines) {
      await client.query(
        `INSERT INTO inventory_transfer_lines (transfer_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [id, ln.productId, ln.quantity]
      );
    }
    await client.query("COMMIT");
    return { id };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Advances transfer to `dispatched` (decrements stock on from_store) or `received` (increments on to_store)
 * Both moves are recorded in the stock ledger atomically.
 */
export async function advanceTransfer(
  pool: Pool,
  id: string,
  to: "dispatched" | "received" | "cancelled"
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: tRows } = await client.query<{
      status: "draft" | "dispatched" | "received" | "cancelled";
      from_store_id: string | null;
      to_store_id: string | null;
    }>(
      `SELECT status,
              from_store_id::text AS from_store_id,
              to_store_id::text AS to_store_id
         FROM inventory_transfers WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const t = tRows[0];
    if (!t) {
      await client.query("ROLLBACK");
      return false;
    }

    if (to === "dispatched") {
      if (t.status !== "draft") {
        await client.query("ROLLBACK");
        return false;
      }
      const { rows: lns } = await client.query<{ product_id: string; quantity: string }>(
        `SELECT product_id::text AS product_id, quantity::text AS quantity
           FROM inventory_transfer_lines WHERE transfer_id = $1`,
        [id]
      );
      for (const ln of lns) {
        await applyStockMove(client, {
          productId: ln.product_id,
          delta: -Number(ln.quantity),
          movementKind: "transfer_out",
          storeId: t.from_store_id,
          referenceType: "transfer",
          referenceId: id,
        });
      }
      await client.query(`UPDATE inventory_transfers SET status='dispatched', dispatched_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
    } else if (to === "received") {
      if (t.status !== "dispatched") {
        await client.query("ROLLBACK");
        return false;
      }
      const { rows: lns } = await client.query<{ product_id: string; quantity: string }>(
        `SELECT product_id::text AS product_id, quantity::text AS quantity
           FROM inventory_transfer_lines WHERE transfer_id = $1`,
        [id]
      );
      for (const ln of lns) {
        await applyStockMove(client, {
          productId: ln.product_id,
          delta: Number(ln.quantity),
          movementKind: "transfer_in",
          storeId: t.to_store_id,
          referenceType: "transfer",
          referenceId: id,
        });
      }
      await client.query(`UPDATE inventory_transfers SET status='received', received_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
    } else {
      // cancelled
      if (t.status === "received") {
        await client.query("ROLLBACK");
        return false;
      }
      await client.query(`UPDATE inventory_transfers SET status='cancelled', cancelled_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function applyStockMove(
  client: PoolClient,
  input: {
    productId: string;
    delta: number;
    movementKind: string;
    storeId: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
  }
): Promise<void> {
  const result = await client.query(
    `UPDATE inventory_products
        SET quantity = quantity + $2, updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
        AND ($2 >= 0 OR quantity >= ABS($2))`,
    [input.productId, input.delta]
  );
  if ((result.rowCount ?? 0) !== 1) {
    throw new Error("Product not found or insufficient stock for movement.");
  }
  await client.query(
    `INSERT INTO inventory_stock_ledger (product_id, movement_kind, quantity_delta, store_id, reference_type, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [input.productId, input.movementKind, input.delta, input.storeId, input.referenceType ?? null, input.referenceId ?? null]
  );
}

// ── Purchase Orders ───────────────────────────────────────────────────

export type POHeaderRow = {
  id: string;
  po_number: string;
  supplier_id: string | null;
  supplier_name: string | null;
  status: "draft" | "sent" | "received" | "partial" | "cancelled";
  expected_at: string | null;
  received_at: string | null;
  total_amount: string;
  currency: string;
  notes: string | null;
  created_at: string;
};

export type POLineRow = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
  unit_cost: string;
  received_qty: string;
};

export async function listPurchaseOrders(pool: Pool): Promise<POHeaderRow[]> {
  const { rows } = await pool.query<POHeaderRow>(
    `SELECT po.id::text AS id, po.po_number, po.supplier_id::text AS supplier_id,
            s.name AS supplier_name, po.status,
            po.expected_at::text AS expected_at,
            po.received_at::text AS received_at,
            po.total_amount::text AS total_amount,
            po.currency, po.notes,
            po.created_at::text AS created_at
       FROM inventory_purchase_orders po
       LEFT JOIN inventory_suppliers s ON s.id = po.supplier_id
      ORDER BY po.created_at DESC`
  );
  return rows;
}

export async function getPurchaseOrderLines(pool: Pool, poId: string): Promise<POLineRow[]> {
  const { rows } = await pool.query<POLineRow>(
    `SELECT l.id::text AS id, l.product_id::text AS product_id, p.name AS product_name,
            l.quantity::text AS quantity, l.unit_cost::text AS unit_cost,
            l.received_qty::text AS received_qty
       FROM inventory_purchase_order_lines l
       LEFT JOIN inventory_products p ON p.id = l.product_id
      WHERE l.po_id = $1
      ORDER BY l.id ASC`,
    [poId]
  );
  return rows;
}

export async function createPurchaseOrder(
  pool: Pool,
  input: {
    poNumber: string;
    supplierId: string | null;
    expectedAt: string | null;
    currency: string;
    notes: string | null;
    lines: Array<{ productId: string; quantity: number; unitCost: number }>;
  }
): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total = input.lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO inventory_purchase_orders (po_number, supplier_id, status, expected_at, total_amount, currency, notes)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6)
       RETURNING id::text AS id`,
      [input.poNumber.trim(), input.supplierId, input.expectedAt, total, input.currency, input.notes?.trim() || null]
    );
    const id = rows[0]!.id;
    for (const ln of input.lines) {
      await client.query(
        `INSERT INTO inventory_purchase_order_lines (po_id, product_id, quantity, unit_cost)
         VALUES ($1, $2, $3, $4)`,
        [id, ln.productId, ln.quantity, ln.unitCost]
      );
    }
    await client.query("COMMIT");
    return { id };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function receivePurchaseOrder(pool: Pool, id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: poRows } = await client.query<{ status: string }>(
      `SELECT status FROM inventory_purchase_orders WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (!poRows[0] || poRows[0].status === "received" || poRows[0].status === "cancelled") {
      await client.query("ROLLBACK");
      return false;
    }
    const { rows: lns } = await client.query<{ id: string; product_id: string; quantity: string; received_qty: string }>(
      `SELECT id::text AS id, product_id::text AS product_id, quantity::text AS quantity, received_qty::text AS received_qty
         FROM inventory_purchase_order_lines WHERE po_id = $1`,
      [id]
    );
    for (const ln of lns) {
      const remaining = Number(ln.quantity) - Number(ln.received_qty);
      if (remaining > 0) {
        await applyStockMove(client, {
          productId: ln.product_id,
          delta: remaining,
          movementKind: "purchase_in",
          storeId: null,
          referenceType: "purchase_order",
          referenceId: id,
        });
        await client.query(`UPDATE inventory_purchase_order_lines SET received_qty = quantity WHERE id = $1`, [ln.id]);
      }
    }
    await client.query(`UPDATE inventory_purchase_orders SET status='received', received_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// ── BOM ────────────────────────────────────────────────────────────────

export type BomHeaderRow = {
  id: string;
  name: string;
  pooja_seva_id: string | null;
  pooja_seva_name: string | null;
  description: string | null;
  is_active: boolean;
};

export type BomLineRow = {
  id: string;
  product_id: string;
  product_name: string | null;
  quantity: string;
  is_optional: boolean;
  notes: string | null;
};

export async function listBoms(pool: Pool): Promise<BomHeaderRow[]> {
  const { rows } = await pool.query<BomHeaderRow>(
    `SELECT b.id::text AS id, b.name, b.pooja_seva_id::text AS pooja_seva_id,
            ps.name AS pooja_seva_name, b.description, b.is_active
       FROM inventory_bom b
       LEFT JOIN master_pooja_sevas ps ON ps.id = b.pooja_seva_id
      WHERE b.deleted_at IS NULL
      ORDER BY b.name ASC`
  );
  return rows;
}

export async function getBomLines(pool: Pool, bomId: string): Promise<BomLineRow[]> {
  const { rows } = await pool.query<BomLineRow>(
    `SELECT l.id::text AS id, l.product_id::text AS product_id, p.name AS product_name,
            l.quantity::text AS quantity, l.is_optional, l.notes
       FROM inventory_bom_lines l
       LEFT JOIN inventory_products p ON p.id = l.product_id
      WHERE l.bom_id = $1
      ORDER BY l.id ASC`,
    [bomId]
  );
  return rows;
}

export async function createBom(
  pool: Pool,
  input: {
    name: string;
    poojaSevaId: string | null;
    description: string | null;
    isActive: boolean;
    lines: Array<{ productId: string; quantity: number; isOptional: boolean; notes: string | null }>;
  }
): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO inventory_bom (name, pooja_seva_id, description, is_active)
       VALUES ($1,$2,$3,$4) RETURNING id::text AS id`,
      [input.name.trim(), input.poojaSevaId, input.description?.trim() || null, input.isActive]
    );
    const id = rows[0]!.id;
    for (const ln of input.lines) {
      await client.query(
        `INSERT INTO inventory_bom_lines (bom_id, product_id, quantity, is_optional, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        [id, ln.productId, ln.quantity, ln.isOptional, ln.notes?.trim() || null]
      );
    }
    await client.query("COMMIT");
    return { id };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function softDeleteBom(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(`UPDATE inventory_bom SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}

// ── Reorder alerts (computed from products) ────────────────────────────

export type LowStockProductRow = {
  id: string;
  name: string;
  sku: string;
  quantity: string;
  reorder_point: string | null;
  unit: string;
  category: string;
  status: "low" | "out";
};

export async function listLowStockProducts(pool: Pool): Promise<LowStockProductRow[]> {
  const { rows } = await pool.query<LowStockProductRow>(
    `SELECT id::text AS id, name, sku, quantity::text AS quantity,
            reorder_point::text AS reorder_point, unit, category,
            CASE WHEN quantity <= 0 THEN 'out' ELSE 'low' END AS status
       FROM inventory_products
      WHERE deleted_at IS NULL
        AND (
          quantity <= 0
          OR (reorder_point IS NOT NULL AND quantity <= reorder_point)
        )
      ORDER BY quantity ASC, name ASC`
  );
  return rows;
}
