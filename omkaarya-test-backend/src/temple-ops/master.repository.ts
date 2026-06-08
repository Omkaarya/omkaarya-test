import type { Pool } from "pg";

export type PoojaSevaRow = {
  id: string;
  name: string;
  code: string | null;
  category: string;
  duration_minutes: number | null;
  price_amount: string;
  currency: string;
  prasad_text: string | null;
  priest_name: string | null;
  description: string | null;
  online_enabled: boolean;
  is_active: boolean;
  sort_order: number;
};

export type ScheduleRow = {
  id: string;
  pooja_seva_id: string | null;
  pooja_name: string;
  days: string[];
  time_of_day: string | null;
  priest_name: string | null;
  max_slots: number | null;
  cutoff_hours: number | null;
  is_active: boolean;
};

export type FestivalRow = {
  id: string;
  name: string;
  festival_date: string | null;
  category: string;
  description: string | null;
  priest_name: string | null;
  is_active: boolean;
};

export type PanchangamRow = {
  id: string;
  panch_date: string;
  festival_label: string | null;
  type_label: string | null;
  auspicious_label: string | null;
  notes: string | null;
};

export type UomRow = {
  id: string;
  kind: "base" | "bulk";
  name: string;
  abbreviation: string;
  type_label: string;
  base_unit_id: string | null;
  quantity_per_bulk: string | null;
};

// ---------- Pooja Sevas ----------

export async function listPoojaSevas(pool: Pool): Promise<PoojaSevaRow[]> {
  const { rows } = await pool.query<PoojaSevaRow>(
    `SELECT id::text AS id, name, code, category, duration_minutes,
            price_amount::text AS price_amount, currency, prasad_text, priest_name,
            description, online_enabled, is_active, sort_order
       FROM master_pooja_sevas
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export type InsertPoojaSevaInput = {
  name: string;
  code: string | null;
  category: string;
  durationMinutes: number | null;
  priceAmount: number;
  currency: string;
  prasadText: string | null;
  priestName: string | null;
  description: string | null;
  onlineEnabled: boolean;
  isActive: boolean;
  sortOrder: number;
};

export async function insertPoojaSeva(pool: Pool, input: InsertPoojaSevaInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO master_pooja_sevas (
       name, code, category, duration_minutes, price_amount, currency,
       prasad_text, priest_name, description, online_enabled, is_active, sort_order
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id::text AS id`,
    [
      input.name.trim(),
      input.code?.trim() || null,
      input.category.trim(),
      input.durationMinutes,
      input.priceAmount,
      input.currency.trim() || "INR",
      input.prasadText?.trim() || null,
      input.priestName?.trim() || null,
      input.description?.trim() || null,
      input.onlineEnabled,
      input.isActive,
      input.sortOrder,
    ]
  );
  return { id: rows[0]!.id };
}

export type UpdatePoojaSevaInput = Partial<InsertPoojaSevaInput>;

export async function updatePoojaSeva(pool: Pool, id: string, input: UpdatePoojaSevaInput): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const map: Record<string, [string, unknown]> = {
    name: ["name", input.name?.trim()],
    code: ["code", input.code?.trim() || null],
    category: ["category", input.category?.trim()],
    durationMinutes: ["duration_minutes", input.durationMinutes],
    priceAmount: ["price_amount", input.priceAmount],
    currency: ["currency", input.currency?.trim()],
    prasadText: ["prasad_text", input.prasadText?.trim() || null],
    priestName: ["priest_name", input.priestName?.trim() || null],
    description: ["description", input.description?.trim() || null],
    onlineEnabled: ["online_enabled", input.onlineEnabled],
    isActive: ["is_active", input.isActive],
    sortOrder: ["sort_order", input.sortOrder],
  };
  for (const [k, [col, val]] of Object.entries(map)) {
    if (input[k as keyof UpdatePoojaSevaInput] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val);
    }
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const sql = `UPDATE master_pooja_sevas SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`;
  const r = await pool.query(sql, params);
  return (r.rowCount ?? 0) > 0;
}

export async function softDeletePoojaSeva(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE master_pooja_sevas SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- Schedules ----------

export async function listSchedules(pool: Pool): Promise<ScheduleRow[]> {
  const { rows } = await pool.query<ScheduleRow>(
    `SELECT id::text AS id, pooja_seva_id::text AS pooja_seva_id, pooja_name,
            days, time_of_day::text AS time_of_day, priest_name, max_slots,
            cutoff_hours, is_active
       FROM master_schedules
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export type InsertScheduleInput = {
  poojaSevaId: string | null;
  poojaName: string;
  days: string[];
  timeOfDay: string | null;
  priestName: string | null;
  maxSlots: number | null;
  cutoffHours: number | null;
  isActive: boolean;
};

export async function insertSchedule(pool: Pool, input: InsertScheduleInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO master_schedules (
       pooja_seva_id, pooja_name, days, time_of_day, priest_name, max_slots, cutoff_hours, is_active
     ) VALUES ($1,$2,$3,$4::time,$5,$6,$7,$8)
     RETURNING id::text AS id`,
    [
      input.poojaSevaId,
      input.poojaName.trim(),
      input.days,
      input.timeOfDay,
      input.priestName?.trim() || null,
      input.maxSlots,
      input.cutoffHours,
      input.isActive,
    ]
  );
  return { id: rows[0]!.id };
}

export async function softDeleteSchedule(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE master_schedules SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- Festivals ----------

export async function listFestivals(pool: Pool): Promise<FestivalRow[]> {
  const { rows } = await pool.query<FestivalRow>(
    `SELECT id::text AS id, name, festival_date::text AS festival_date, category,
            description, priest_name, is_active
       FROM master_festivals
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export type InsertFestivalInput = {
  name: string;
  festivalDate: string | null;
  category: string;
  description: string | null;
  priestName: string | null;
  isActive: boolean;
};

export async function insertFestival(pool: Pool, input: InsertFestivalInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO master_festivals (name, festival_date, category, description, priest_name, is_active)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id::text AS id`,
    [
      input.name.trim(),
      input.festivalDate,
      input.category.trim(),
      input.description?.trim() || null,
      input.priestName?.trim() || null,
      input.isActive,
    ]
  );
  return { id: rows[0]!.id };
}

export async function softDeleteFestival(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE master_festivals SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- Panchangam ----------

export async function listPanchangam(pool: Pool): Promise<PanchangamRow[]> {
  const { rows } = await pool.query<PanchangamRow>(
    `SELECT id::text AS id, panch_date::text AS panch_date, festival_label, type_label,
            auspicious_label, notes
       FROM master_panchangam
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export type InsertPanchangamInput = {
  panchDate: string;
  festivalLabel: string | null;
  typeLabel: string | null;
  auspiciousLabel: string | null;
  notes: string | null;
};

export async function insertPanchangam(pool: Pool, input: InsertPanchangamInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO master_panchangam (panch_date, festival_label, type_label, auspicious_label, notes)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id::text AS id`,
    [
      input.panchDate,
      input.festivalLabel?.trim() || null,
      input.typeLabel?.trim() || null,
      input.auspiciousLabel?.trim() || null,
      input.notes?.trim() || null,
    ]
  );
  return { id: rows[0]!.id };
}

export async function softDeletePanchangam(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE master_panchangam SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}

// ---------- UOMs ----------

export async function listUoms(pool: Pool): Promise<UomRow[]> {
  const { rows } = await pool.query<UomRow>(
    `SELECT id::text AS id, kind, name, abbreviation, type_label,
            base_unit_id::text AS base_unit_id, quantity_per_bulk::text AS quantity_per_bulk
       FROM master_uoms
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
  );
  return rows;
}

export type InsertUomInput = {
  kind: "base" | "bulk";
  name: string;
  abbreviation: string;
  typeLabel: string;
  baseUnitId: string | null;
  quantityPerBulk: number | null;
};

export async function insertUom(pool: Pool, input: InsertUomInput): Promise<{ id: string }> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO master_uoms (kind, name, abbreviation, type_label, base_unit_id, quantity_per_bulk)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id::text AS id`,
    [
      input.kind,
      input.name.trim(),
      input.abbreviation.trim(),
      input.typeLabel.trim() || "Unit (count)",
      input.baseUnitId,
      input.quantityPerBulk,
    ]
  );
  return { id: rows[0]!.id };
}

export async function updateUom(pool: Pool, id: string, input: Partial<InsertUomInput>): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const map: Record<string, [string, unknown]> = {
    kind: ["kind", input.kind],
    name: ["name", input.name?.trim()],
    abbreviation: ["abbreviation", input.abbreviation?.trim()],
    typeLabel: ["type_label", input.typeLabel?.trim()],
    baseUnitId: ["base_unit_id", input.baseUnitId],
    quantityPerBulk: ["quantity_per_bulk", input.quantityPerBulk],
  };
  for (const [k, [col, val]] of Object.entries(map)) {
    if (input[k as keyof typeof input] !== undefined) {
      sets.push(`${col} = $${i++}`);
      params.push(val);
    }
  }
  if (sets.length === 0) return true;
  sets.push(`updated_at = NOW()`);
  params.push(id);
  const r = await pool.query(
    `UPDATE master_uoms SET ${sets.join(", ")} WHERE id = $${i} AND deleted_at IS NULL`,
    params
  );
  return (r.rowCount ?? 0) > 0;
}

export async function softDeleteUom(pool: Pool, id: string): Promise<boolean> {
  const r = await pool.query(
    `UPDATE master_uoms SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return (r.rowCount ?? 0) > 0;
}
