import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import type { MockTemple } from "@/lib/mock-temples";
import { getPoolConfig } from "@/lib/pg-config";

const ADMIN_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTemporaryPassword(): string {
  return randomBytes(12).toString("base64url");
}

let pool: Pool | null = null;

function getPool(): Pool {
  const config = getPoolConfig();
  if (!config) {
    throw new Error(
      "Database not configssured. Set DATABASE_URL or DB_USER, DB_HOST, DB_NAME (and DB_PASS, DB_PORT) in .env.local."
    );
  }
  if (!pool) {
    pool = new Pool(config);
  }
  return pool;
}

function rowToTemple(r: {
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
}): MockTemple {
  return {
    tenantId: r.tenant_id,
    name: r.name,
    slug: r.slug,
    countryCode: r.country_code,
    countryFlag: r.country_flag,
    city: r.city,
    plan: r.plan as MockTemple["plan"],
    devotees: r.devotees,
    status: r.status as MockTemple["status"],
    compliance: r.compliance as MockTemple["compliance"],
    adminEmail: r.admin_email,
  };
}

export async function fetchTemplesFromDb(): Promise<MockTemple[]> {
  const p = getPool();
  const result = await p.query<{
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
  return result.rows.map(rowToTemple);
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

const PLANS = ["Prarambha", "Sankalpa", "Aaradhana", "Free"] as const;

function normalizePlan(raw: string): (typeof PLANS)[number] {
  return PLANS.includes(raw as (typeof PLANS)[number]) ? (raw as (typeof PLANS)[number]) : "Sankalpa";
}

function buildSlug(subdomain: string): string {
  const s = subdomain.trim();
  if (!s) return "temple.omkaarya.com";
  return s.includes(".") ? s : `${s}.omkaarya.com`;
}

export async function insertTempleFromPayload(payload: {
  temple: {
    name: string;
    country: string;
    city: string;
    email: string;
    subdomain: string;
  };
  admin: { email: string };
  planBilling: { selectedPlan: string; trial: { enabled: boolean } };
}): Promise<{ templeId: string }> {
  const p = getPool();
  const client = await p.connect();
  try {
    const maxRes = await client.query<{ m: number | null }>(
      `SELECT MAX(tenant_id::int) AS m FROM public.temples WHERE tenant_id ~ '^[0-9]+$'`
    );
    const maxNum = maxRes.rows[0]?.m ?? 1000;
    const tenantId = String(maxNum + 1);
    const countryCode = payload.temple.country.trim() || "GB";
    const plan = normalizePlan(payload.planBilling.selectedPlan);
    const trial = payload.planBilling.trial?.enabled === true;
    const name = payload.temple.name.trim() || "Unnamed temple";
    const slug = buildSlug(payload.temple.subdomain);
    const city = payload.temple.city.trim() || "—";
    const adminEmail =
      payload.admin.email.trim() || payload.temple.email.trim() || "";

    let adminUserId: number | null = null;
    await client.query("BEGIN");
    try {
      if (ADMIN_EMAIL_RE.test(adminEmail)) {
        const existing = await client.query<{ password_hash: string | null }>(
          "SELECT password_hash FROM public.users WHERE email = $1 LIMIT 1",
          [adminEmail]
        );
        if (existing.rows.length === 0) {
          const tempPassword = generateTemporaryPassword();
          await client.query(`INSERT INTO public.users (email, temp_password) VALUES ($1, $2)`, [
            adminEmail,
            tempPassword,
          ]);
        } else if (existing.rows[0]!.password_hash == null) {
          const tempPassword = generateTemporaryPassword();
          await client.query(
            `INSERT INTO public.users (email, temp_password)
             VALUES ($1, $2)
             ON CONFLICT (email) DO UPDATE SET temp_password = EXCLUDED.temp_password`,
            [adminEmail, tempPassword]
          );
        }
        const idRes = await client.query<{ id: number }>(
          "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
          [adminEmail]
        );
        adminUserId = idRes.rows[0]?.id ?? null;
      }

      await client.query(
        `INSERT INTO public.temples (
           tenant_id, name, slug, country_code, country_flag, city, plan, devotees, status, compliance, admin_email,
           admin_user_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          tenantId,
          name,
          slug,
          countryCode,
          FLAG_BY_CODE[countryCode] ?? "",
          city,
          plan,
          0,
          trial ? "Trial" : "Active",
          "Pending",
          adminEmail,
          adminUserId,
        ]
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    }
    return { templeId: tenantId };
  } finally {
    client.release();
  }
}
