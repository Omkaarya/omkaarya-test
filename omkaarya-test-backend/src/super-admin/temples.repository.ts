import { randomBytes } from "node:crypto";
import { getPool } from "../db/pool.js";
import type {
  CreateTemplePayload,
  PhoneRowJson,
  TempleCompliance,
  TempleFullAddressJson,
  TemplePlan,
  TempleRecord,
  TempleSessionProfileResponse,
  TempleStatus,
} from "./types.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

const ADMIN_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTemporaryPassword(): string {
  return randomBytes(12).toString("base64url");
}

export interface TempleRepository {
  listAll(): Promise<TempleRecord[]>;
  createTemple(payload: CreateTemplePayload): Promise<{ templeId: string; temporaryPassword?: string }>;
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

function parsePhoneJson(value: unknown): PhoneRowJson {
  if (value && typeof value === "object" && "countryCode" in value && "nationalNumber" in value) {
    const o = value as Record<string, unknown>;
    return {
      countryCode: typeof o.countryCode === "string" ? o.countryCode : "",
      nationalNumber: typeof o.nationalNumber === "string" ? o.nationalNumber : "",
    };
  }
  return { countryCode: "", nationalNumber: "" };
}

function parseFullAddressJson(value: unknown): TempleFullAddressJson {
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return {
      countryIso: typeof o.countryIso === "string" ? o.countryIso : "",
      state: typeof o.state === "string" ? o.state : "",
      city: typeof o.city === "string" ? o.city : "",
      postalCode: typeof o.postalCode === "string" ? o.postalCode : "",
      street: typeof o.street === "string" ? o.street : "",
    };
  }
  return { countryIso: "", state: "", city: "", postalCode: "", street: "" };
}

function phoneFromPayloadUnknown(input: unknown): PhoneRowJson {
  const p = parsePhoneJson(input);
  if (p.countryCode || p.nationalNumber) return p;
  return { countryCode: "+91", nationalNumber: "" };
}

export type SaveTempleProfileDetailsInput = {
  sessionEmail: string;
  websiteUrl: string;
  fax: PhoneRowJson;
  domainSubdomain: string;
  establishedYear: string;
  fullAddress: TempleFullAddressJson;
  logoDataUrl: string | null;
};

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

  async getTempleSessionProfileByAdminEmail(adminEmail: string): Promise<TempleSessionProfileResponse | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const email = adminEmail.trim();
    if (!email) return null;

    const result = await pool.query<{
      tenant_id: string;
      name: string;
      country_code: string;
      city: string;
      admin_email: string;
      contact_email: string | null;
      charity_registered: boolean;
      charity_registration_number: string | null;
      contact_phone: unknown;
      website_url: string | null;
      fax: unknown;
      domain_subdomain: string | null;
      established_year: string | null;
      full_address: unknown;
      logo_data_url: string | null;
    }>(
      `SELECT tenant_id, name, country_code, city, admin_email,
              contact_email, charity_registered, charity_registration_number, contact_phone,
              website_url, fax, domain_subdomain, established_year, full_address, logo_data_url
       FROM public.temples
       WHERE ${sqlTempleMatchesSessionEmail(1)}
       LIMIT 1`,
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;

    const contactEmail = (row.contact_email ?? row.admin_email).trim();
    const phone = parsePhoneJson(row.contact_phone);

    return {
      success: true,
      templeId: row.tenant_id,
      core: {
        templeName: row.name,
        charity: {
          registered: row.charity_registered,
          registrationNumber: (row.charity_registration_number ?? "").trim(),
        },
        email: contactEmail,
        phone,
        location: { countryIso: row.country_code, city: row.city },
      },
      details: {
        logoDataUrl: row.logo_data_url,
        websiteUrl: (row.website_url ?? "").trim(),
        fax: parsePhoneJson(row.fax),
        domainSubdomain: (row.domain_subdomain ?? "").trim(),
        establishedYear: (row.established_year ?? "").trim(),
        fullAddress: parseFullAddressJson(row.full_address),
      },
    };
  }

  async saveTempleProfileDetails(input: SaveTempleProfileDetailsInput): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const sessionEmail = input.sessionEmail.trim();
    const res = await pool.query<{ tenant_id: string }>(
      `UPDATE public.temples
       SET website_url = $2,
           fax = $3::jsonb,
           domain_subdomain = $4,
           established_year = $5,
           full_address = $6::jsonb,
           logo_data_url = $7
       WHERE ${sqlTempleMatchesSessionEmail(1)}
       RETURNING tenant_id`,
      [
        sessionEmail,
        input.websiteUrl.trim() || null,
        JSON.stringify(input.fax),
        input.domainSubdomain.trim() || null,
        input.establishedYear.trim() || null,
        JSON.stringify(input.fullAddress),
        input.logoDataUrl,
      ]
    );
    if (res.rows.length === 0) return { ok: false, reason: "not_found" };
    return { ok: true };
  }

  async createTemple(payload: CreateTemplePayload): Promise<{ templeId: string; temporaryPassword?: string }> {
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

      const contactEmail = payload.temple.email.trim() || null;
      const contactPhone = phoneFromPayloadUnknown(payload.temple.phone);

      let temporaryPassword: string | undefined;
      await client.query("BEGIN");
      try {
        let adminUserId: number | null = null;
        if (ADMIN_EMAIL_RE.test(row.adminEmail)) {
          const existing = await client.query<{ password_hash: string | null }>(
            "SELECT password_hash FROM public.users WHERE email = $1 LIMIT 1",
            [row.adminEmail]
          );
          if (existing.rows.length === 0) {
            temporaryPassword = generateTemporaryPassword();
            await client.query(`INSERT INTO public.users (email, temp_password) VALUES ($1, $2)`, [
              row.adminEmail,
              temporaryPassword,
            ]);
          } else if (existing.rows[0]!.password_hash != null) {
            // Temple admin onboarding: user already set a permanent password — do not reset invite fields.
          } else {
            temporaryPassword = generateTemporaryPassword();
            await client.query(
              `INSERT INTO public.users (email, temp_password)
               VALUES ($1, $2)
               ON CONFLICT (email) DO UPDATE SET temp_password = EXCLUDED.temp_password`,
              [row.adminEmail, temporaryPassword]
            );
          }
          const idRes = await client.query<{ id: number }>(
            "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
            [row.adminEmail]
          );
          adminUserId = idRes.rows[0]?.id ?? null;
        }

        await client.query(
          `INSERT INTO public.temples (
             tenant_id, name, slug, country_code, country_flag, city, plan, devotees, status, compliance, admin_email,
             admin_user_id,
             contact_email, charity_registered, charity_registration_number, contact_phone
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb)`,
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
            adminUserId,
            contactEmail,
            false,
            null,
            JSON.stringify(contactPhone),
          ]
        );

        if (ADMIN_EMAIL_RE.test(row.adminEmail)) {
          await client.query(`UPDATE public.users SET tenant_id = $1 WHERE lower(trim(email)) = lower(trim($2))`, [
            row.tenantId,
            row.adminEmail,
          ]);
        }

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }

      return { templeId: row.tenantId, temporaryPassword };
    } finally {
      client.release();
    }
  }
}
