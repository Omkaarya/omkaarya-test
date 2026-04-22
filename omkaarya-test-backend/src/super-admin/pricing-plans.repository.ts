import { getPool } from "../db/pool.js";
import type { CreatePricingPlanPayload, PricingPlan, UpdatePricingPlanPayload } from "./types.js";

function toPricingPlan(row: any): PricingPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceMonthly: row.price_monthly,
    priceYearly: row.price_yearly,
    popular: row.popular,
    includedSeats: row.included_seats,
    extraSeatPriceMonthly: row.extra_seat_price_monthly,
    features: row.features || [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class PostgresPricingPlansRepository {
  async getAll(): Promise<PricingPlan[]> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const { rows } = await pool.query(
      `SELECT * FROM public.pricing_plans ORDER BY created_at ASC`
    );
    return rows.map(toPricingPlan);
  }

  async getById(id: string): Promise<PricingPlan | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const { rows } = await pool.query(
      `SELECT * FROM public.pricing_plans WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    return toPricingPlan(rows[0]);
  }

  async create(payload: CreatePricingPlanPayload): Promise<PricingPlan> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const { rows } = await pool.query(
      `INSERT INTO public.pricing_plans 
        (name, description, price_monthly, price_yearly, popular, included_seats, extra_seat_price_monthly, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING *`,
      [
        payload.name,
        payload.description ?? null,
        payload.priceMonthly,
        payload.priceYearly,
        payload.popular ?? false,
        payload.includedSeats,
        payload.extraSeatPriceMonthly,
        JSON.stringify(payload.features),
      ]
    );
    return toPricingPlan(rows[0]);
  }

  async update(id: string, payload: UpdatePricingPlanPayload): Promise<PricingPlan | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(payload.name);
    }
    if (payload.description !== undefined) {
      updates.push(`description = $${idx++}`);
      values.push(payload.description);
    }
    if (payload.priceMonthly !== undefined) {
      updates.push(`price_monthly = $${idx++}`);
      values.push(payload.priceMonthly);
    }
    if (payload.priceYearly !== undefined) {
      updates.push(`price_yearly = $${idx++}`);
      values.push(payload.priceYearly);
    }
    if (payload.popular !== undefined) {
      updates.push(`popular = $${idx++}`);
      values.push(payload.popular);
    }
    if (payload.includedSeats !== undefined) {
      updates.push(`included_seats = $${idx++}`);
      values.push(payload.includedSeats);
    }
    if (payload.extraSeatPriceMonthly !== undefined) {
      updates.push(`extra_seat_price_monthly = $${idx++}`);
      values.push(payload.extraSeatPriceMonthly);
    }
    if (payload.features !== undefined) {
      updates.push(`features = $${idx++}::jsonb`);
      values.push(JSON.stringify(payload.features));
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE public.pricing_plans
       SET ${updates.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values
    );

    if (rows.length === 0) return null;
    return toPricingPlan(rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) throw new Error("Database pool is not available");

    const { rowCount } = await pool.query(
      `DELETE FROM public.pricing_plans WHERE id = $1`,
      [id]
    );
    return rowCount !== null && rowCount > 0;
  }
}
