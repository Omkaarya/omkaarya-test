import { randomBytes } from "node:crypto";
import { getPool } from "../db/pool.js";
import type {
  CreateTemplePayload,
  PhoneRowJson,
  SuperAdminTempleDetailResponse,
  TempleCompliance,
  TempleFullAddressJson,
  TemplePlan,
  TempleRecord,
  TempleSessionProfileResponse,
  TempleStatus,
  UpdateTemplePayload,
} from "./types.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";

const ADMIN_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTemporaryPassword(): string {
  return randomBytes(12).toString("base64url");
}

export interface TempleRepository {
  listAll(): Promise<TempleRecord[]>;
  createTemple(payload: CreateTemplePayload): Promise<{ templeId: string; temporaryPassword?: string }>;
  getTempleForEdit(tenantId: string): Promise<SuperAdminTempleDetailResponse | null>;
  updateTemple(tenantId: string, payload: UpdateTemplePayload): Promise<{ ok: true } | { ok: false; reason: "not_found" }>;
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

const PLANS: TemplePlan[] = ["Prarambha", "Sankalpa", "Aaradhana", "Free"];

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

function fullAddressFromPayload(temple: CreateTemplePayload["temple"]): TempleFullAddressJson {
  return {
    countryIso: temple.country.trim() || "GB",
    state: "",
    city: temple.city.trim() || "",
    postalCode: "",
    street: temple.address.trim() || "",
  };
}

function websiteUrlFromPath(raw: string): string | null {
  const w = raw.trim();
  if (!w) return null;
  if (/^https?:\/\//i.test(w)) return w;
  return `http://${w}`;
}

function websitePathFromStored(url: string | null): string {
  if (!url?.trim()) return "";
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").trim();
}

function subdomainFromSlugAndDomain(slug: string, domainSubdomain: string | null): string {
  const d = (domainSubdomain ?? "").trim();
  if (d) return d;
  const s = slug.trim();
  return s.replace(/\.omkaarya\.com$/i, "").replace(/^https?:\/\//i, "");
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
      const contactWhatsapp = phoneFromPayloadUnknown(payload.temple.whatsapp);
      const faxJson = phoneFromPayloadUnknown(payload.temple.fax);
      const fullAddr = fullAddressFromPayload(payload.temple);
      const websiteUrl = websiteUrlFromPath(payload.temple.website);
      const establishedYear = payload.temple.establishedYear.trim() || null;
      const domainSub = payload.temple.subdomain.trim() || null;
      const tradition = payload.temple.tradition.trim() || null;
      const primaryDeity = payload.temple.deity.trim() || null;
      const billingCycle = payload.planBilling.billingCycle.trim() || null;

      let temporaryPassword: string | undefined;
      await client.query("BEGIN");
      try {
        let adminUserId: number | null = null;
        if (ADMIN_EMAIL_RE.test(row.adminEmail)) {
          const adminFullName = payload.admin.fullName?.trim() ?? "";
          const adminWhatsapp = payload.admin.whatsapp?.trim() ?? "";
          const adminRole = payload.admin.role?.trim() ?? "";
          const adminRoles = adminRole ? [adminRole] : [];

          const existing = await client.query<{ password_hash: string | null }>(
            "SELECT password_hash FROM public.users WHERE email = $1 LIMIT 1",
            [row.adminEmail]
          );
          if (existing.rows.length === 0) {
            temporaryPassword = generateTemporaryPassword();
            await client.query(
              `INSERT INTO public.users (email, temp_password, full_name, whatsapp, roles)
               VALUES ($1, $2, $3, $4, $5)`,
              [row.adminEmail, temporaryPassword, adminFullName, adminWhatsapp, adminRoles]
            );
          } else if (existing.rows[0]!.password_hash != null) {
            // User already has a permanent password — do not reset password fields, but do overwrite profile fields.
            await client.query(
              `UPDATE public.users
               SET full_name = $1, whatsapp = $2, roles = $3
               WHERE email = $4`,
              [adminFullName, adminWhatsapp, adminRoles, row.adminEmail]
            );
          } else {
            temporaryPassword = generateTemporaryPassword();
            await client.query(
              `INSERT INTO public.users (email, temp_password, full_name, whatsapp, roles)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (email) DO UPDATE
               SET temp_password = EXCLUDED.temp_password,
                   full_name = EXCLUDED.full_name,
                   whatsapp = EXCLUDED.whatsapp,
                   roles = EXCLUDED.roles`,
              [row.adminEmail, temporaryPassword, adminFullName, adminWhatsapp, adminRoles]
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
             tenant_id, name, slug, country_code, country_flag, city, plan, pricing_plan_id, devotees, status, compliance, admin_email,
             admin_user_id,
             contact_email, charity_registered, charity_registration_number,
             contact_phone, contact_whatsapp, fax,
             website_url, domain_subdomain, established_year, full_address,
             tradition, primary_deity_id, billing_cycle,
             logo_data_url
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             (SELECT id FROM public.pricing_plans WHERE name = $27 LIMIT 1),
             $8, $9, $10, $11, $12,
             $13, $14, $15,
             $16::jsonb, $17::jsonb, $18::jsonb,
             $19, $20, $21, $22::jsonb,
             $23, $24, $25,
             $26
           )`,
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
            JSON.stringify(contactWhatsapp),
            JSON.stringify(faxJson),
            websiteUrl,
            domainSub,
            establishedYear,
            JSON.stringify(fullAddr),
            tradition,
            primaryDeity,
            billingCycle,
            null,
            row.plan,
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

  async getTempleForEdit(tenantId: string): Promise<SuperAdminTempleDetailResponse | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const id = tenantId.trim();
    if (!id) return null;

    const result = await pool.query<{
      tenant_id: string;
      name: string;
      slug: string;
      country_code: string;
      city: string;
      plan: string;
      status: string;
      admin_email: string;
      contact_email: string | null;
      contact_phone: unknown;
      contact_whatsapp: unknown;
      fax: unknown;
      website_url: string | null;
      domain_subdomain: string | null;
      established_year: string | null;
      full_address: unknown;
      tradition: string | null;
      primary_deity_id: string | null;
      billing_cycle: string | null;
      logo_data_url: string | null;
      u_full_name: string | null;
      u_whatsapp: string | null;
      u_roles: string[] | null;
      u2_full_name: string | null;
      u2_whatsapp: string | null;
      u2_roles: string[] | null;
    }>(
      `SELECT
         t.tenant_id,
         t.name,
         t.slug,
         t.country_code,
         t.city,
         t.plan,
         t.status,
         t.admin_email,
         t.contact_email,
         t.contact_phone,
         t.contact_whatsapp,
         t.fax,
         t.website_url,
         t.domain_subdomain,
         t.established_year,
         t.full_address,
         t.tradition,
         t.primary_deity_id,
         t.billing_cycle,
         t.logo_data_url,
         u1.full_name AS u_full_name,
         u1.whatsapp AS u_whatsapp,
         u1.roles AS u_roles,
         u2.full_name AS u2_full_name,
         u2.whatsapp AS u2_whatsapp,
         u2.roles AS u2_roles
       FROM public.temples t
       LEFT JOIN public.users u1 ON u1.id = t.admin_user_id
       LEFT JOIN public.users u2 ON t.admin_user_id IS NULL AND lower(trim(u2.email)) = lower(trim(t.admin_email))
       WHERE t.tenant_id = $1
       LIMIT 1`,
      [id]
    );
    const r = result.rows[0];
    if (!r) return null;

    const fa = parseFullAddressJson(r.full_address);
    const country = (fa.countryIso || r.country_code || "GB").trim() || "GB";
    const city = (fa.city || r.city || "").trim() || r.city.trim();
    const addressLine = (fa.street ?? "").trim();
    const email = (r.contact_email ?? r.admin_email ?? "").trim();
    const telephone = parsePhoneJson(r.contact_phone);
    const tWhatsapp = parsePhoneJson(r.contact_whatsapp);
    const fax = parsePhoneJson(r.fax);
    const adminName = (r.u_full_name ?? r.u2_full_name ?? "").trim();
    const adminWhatsappStr = (r.u_whatsapp ?? r.u2_whatsapp ?? "").trim();
    const roles = r.u_roles ?? r.u2_roles ?? [];
    const adminRole = Array.isArray(roles) && roles.length > 0 ? String(roles[0]) : "Temple Admin";

    const trialEnabled = r.status === "Trial";
    const trialDays = trialEnabled ? 7 : null;

    const est = (r.established_year ?? "").trim();
    const establishedYear = est && /^\d{4}$/.test(est) ? est : "2000";

    const response: SuperAdminTempleDetailResponse = {
      tenantId: r.tenant_id,
      temple: {
        tradition: (r.tradition ?? "Hindu").trim() || "Hindu",
        name: r.name.trim(),
        deity: (r.primary_deity_id ?? "").trim(),
        country,
        city,
        address: addressLine,
        email,
        phone: telephone,
        whatsapp: tWhatsapp,
        fax,
        website: websitePathFromStored(r.website_url),
        subdomain: subdomainFromSlugAndDomain(r.slug, r.domain_subdomain),
        establishedYear,
      },
      admin: {
        fullName: adminName,
        email: r.admin_email.trim(),
        whatsapp: adminWhatsappStr,
        role: adminRole,
      },
      planBilling: {
        selectedPlan: r.plan,
        billingCycle: (r.billing_cycle ?? "Annually").trim() || "Annually",
        trial: {
          enabled: trialEnabled,
          days: trialDays,
        },
      },
      logoTempleDataUrl: r.logo_data_url,
    };
    return response;
  }

  async updateTemple(
    tenantId: string,
    payload: UpdateTemplePayload
  ): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database pool is not available");
    }
    const id = tenantId.trim();
    if (!id) return { ok: false, reason: "not_found" };

    const client = await pool.connect();
    try {
      const existing = await client.query<{ admin_email: string; logo_data_url: string | null }>(
        `SELECT admin_email, logo_data_url FROM public.temples WHERE tenant_id = $1 LIMIT 1`,
        [id]
      );
      if (existing.rows.length === 0) return { ok: false, reason: "not_found" };
      const adminEmail = existing.rows[0]!.admin_email.trim();
      const nextLogo =
        payload.logoTempleDataUrl !== undefined ? payload.logoTempleDataUrl : existing.rows[0]!.logo_data_url;

      const countryCode = payload.temple.country.trim() || "GB";
      const plan = normalizePlan(payload.planBilling.selectedPlan);
      const trial = payload.planBilling.trial?.enabled === true;
      const status: TempleStatus = trial ? "Trial" : "Active";
      const name = payload.temple.name.trim() || "Unnamed temple";
      const slug = buildSlug(payload.temple.subdomain);
      const city = payload.temple.city.trim() || "—";
      const contactEmail = payload.temple.email.trim() || null;
      const contactPhone = phoneFromPayloadUnknown(payload.temple.phone);
      const contactWhatsapp = phoneFromPayloadUnknown(payload.temple.whatsapp);
      const faxJson = phoneFromPayloadUnknown(payload.temple.fax);
      const fullAddr = fullAddressFromPayload(payload.temple);
      const websiteUrl = websiteUrlFromPath(payload.temple.website);
      const establishedYear = payload.temple.establishedYear.trim() || null;
      const domainSub = payload.temple.subdomain.trim() || null;
      const tradition = payload.temple.tradition.trim() || null;
      const primaryDeity = payload.temple.deity.trim() || null;
      const billingCycle = payload.planBilling.billingCycle.trim() || null;

      await client.query("BEGIN");
      try {
        await client.query(
          `UPDATE public.temples
           SET name = $2,
               slug = $3,
               country_code = $4,
               country_flag = $5,
               city = $6,
               plan = $7,
               pricing_plan_id = (SELECT id FROM public.pricing_plans WHERE name = $21 LIMIT 1),
               status = $8,
               contact_email = $9,
               contact_phone = $10::jsonb,
               contact_whatsapp = $11::jsonb,
               fax = $12::jsonb,
               website_url = $13,
               domain_subdomain = $14,
               established_year = $15,
               full_address = $16::jsonb,
               tradition = $17,
               primary_deity_id = $18,
               billing_cycle = $19,
               logo_data_url = $20
           WHERE tenant_id = $1`,
          [
            id,
            name,
            slug,
            countryCode,
            FLAG_BY_CODE[countryCode] ?? "",
            city,
            plan,
            status,
            contactEmail,
            JSON.stringify(contactPhone),
            JSON.stringify(contactWhatsapp),
            JSON.stringify(faxJson),
            websiteUrl,
            domainSub,
            establishedYear,
            JSON.stringify(fullAddr),
            tradition,
            primaryDeity,
            billingCycle,
            nextLogo,
            plan,
          ]
        );

        if (ADMIN_EMAIL_RE.test(adminEmail)) {
          const adminFullName = payload.admin.fullName?.trim() ?? "";
          const adminWhatsapp = payload.admin.whatsapp?.trim() ?? "";
          const adminRole = payload.admin.role?.trim() ?? "";
          const adminRoles = adminRole ? [adminRole] : [];
          await client.query(
            `UPDATE public.users
             SET full_name = $1, whatsapp = $2, roles = $3
             WHERE lower(trim(email)) = lower(trim($4))`,
            [adminFullName, adminWhatsapp, adminRoles, adminEmail]
          );
        }

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }

      return { ok: true };
    } finally {
      client.release();
    }
  }
}
