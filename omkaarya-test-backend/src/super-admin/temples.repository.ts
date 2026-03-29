import { getPool } from "../db/pool.js";
import type {
  CreateTemplePayload,
  TempleCompliance,
  TemplePlan,
  TempleRecord,
  TempleStatus,
} from "./types.js";

export interface TempleRepository {
  listAll(): Promise<TempleRecord[]>;
  createTemple(payload: CreateTemplePayload): Promise<{ templeId: string }>;
}

const FLAG_BY_CODE: Record<string, string> = {
  GB: "🇬🇧",
  US: "🇺🇸",
  IN: "🇮🇳",
  AU: "🇦🇺",
  CA: "🇨🇦",
  AE: "🇦🇪",
  SG: "🇸🇬",
  DE: "🇩🇪",
};

const PLANS: TemplePlan[] = ["Aaaradhana", "Sankalpa", "Mandala", "Free"];

function normalizePlan(raw: string): TemplePlan {
  return PLANS.includes(raw as TemplePlan) ? (raw as TemplePlan) : "Sankalpa";
}

function buildSlug(subdomain: string): string {
  const s = subdomain.trim();
  if (!s) return "temple.omkaarya.com";
  return s.includes(".") ? s : `${s}.omkaarya.com`;
}

export class PostgresTempleRepository implements TempleRepository {
  async listAll(): Promise<TempleRecord[]> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const result = await pool.query<{
      tenant_id: string;
      name: string;
      slug: string;
      country_code: string;
      country_flag: string;
      city: string;
      plan: string;
      devotees: number;
      status: string;
      compliance: string;
      admin_email: string;
    }>(
      `SELECT tenant_id, name, slug, country_code, country_flag, city, plan, devotees, status, compliance, admin_email
       FROM public.temples
       ORDER BY tenant_id::int DESC`
    );
    return result.rows.map((r) => ({
      tenantId: r.tenant_id,
      name: r.name,
      slug: r.slug,
      countryCode: r.country_code,
      countryFlag: r.country_flag,
      city: r.city,
      plan: r.plan as TemplePlan,
      devotees: r.devotees,
      status: r.status as TempleStatus,
      compliance: r.compliance as TempleCompliance,
      adminEmail: r.admin_email,
    }));
  }

  async createTemple(payload: CreateTemplePayload): Promise<{ templeId: string }> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const client = await pool.connect();
    try {
      const maxRes = await client.query<{ m: number | null }>(
        `SELECT MAX(tenant_id::int) AS m FROM public.temples WHERE tenant_id ~ '^[0-9]+$'`
      );
      const maxNum = maxRes.rows[0]?.m ?? 1000;
      const tenantId = String(maxNum + 1);
      const countryCode = payload.temple.country.trim() || "GB";
      const plan = normalizePlan(payload.planBilling.selectedPlan);
      const trial = payload.planBilling.trial?.enabled === true;
      const row: TempleRecord = {
        tenantId,
        name: payload.temple.name.trim() || "Unnamed temple",
        slug: buildSlug(payload.temple.subdomain),
        countryCode,
        countryFlag: FLAG_BY_CODE[countryCode] ?? "",
        city: payload.temple.city.trim() || "—",
        plan,
        devotees: 0,
        status: trial ? "Trial" : "Active",
        compliance: "Pending",
        adminEmail: payload.admin.email.trim() || payload.temple.email.trim() || "",
      };
      await client.query(
        `INSERT INTO public.temples (
           tenant_id, name, slug, country_code, country_flag, city, plan, devotees, status, compliance, admin_email
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          row.tenantId,
          row.name,
          row.slug,
          row.countryCode,
          row.countryFlag,
          row.city,
          row.plan,
          row.devotees,
          row.status,
          row.compliance,
          row.adminEmail,
        ]
      );
      return { templeId: `temp_${Date.now()}` };
    } finally {
      client.release();
    }
  }
}
