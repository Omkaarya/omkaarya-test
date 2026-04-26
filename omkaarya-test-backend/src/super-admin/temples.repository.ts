import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { requirePool } from "../db/pool.js";
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
  TemplesQueryInput,
  UpdateTemplePayload,
} from "./types.js";
import { sqlTempleMatchesSessionEmail } from "./temple-admin-match.js";
import { createInitialInvoiceForNewTemple, type CreateInitialInvoiceResult } from "./billing.repository.js";
import { storeBrandingImageIfNeeded } from "../storage/cloudinary.js";

const ADMIN_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class TempleEmailAlreadyInUseError extends Error {
  readonly name = "TempleEmailAlreadyInUseError";
  constructor(
    public readonly conflicts: Array<{
      email: string;
      tenantId: string;
      matchedColumn: "admin_email" | "contact_email";
    }>
  ) {
    super("Admin email or temple email is already used by an existing temple.");
  }
}

function generateTemporaryPassword(): string {
  return randomBytes(12).toString("base64url");
}

export interface TempleRepository {
  listAll(): Promise<TempleRecord[]>;
  listPage(query: TemplesQueryInput): Promise<{
    data: TempleRecord[];
    total: number;
    totalAll: number;
    page: number;
    pageSize: number;
    totalPages: number;
    countries: string[];
  }>;
  createTemple(
    payload: CreateTemplePayload
  ): Promise<{ templeId: string; temporaryPassword?: string; invoice?: CreateInitialInvoiceResult }>;
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

const PLAN_NAME_ALIASES: Readonly<Record<string, TemplePlan>> = {
  prarambha: "Prarambha",
  sankalpa: "Sankalpa",
  aaradhana: "Aaradhana",
  free: "Free",
};

function normalizePlan(raw: string): TemplePlan {
  const t = raw.trim();
  if (PLANS.includes(t as TemplePlan)) return t as TemplePlan;
  const byLower = PLAN_NAME_ALIASES[t.toLowerCase()];
  if (byLower) return byLower;
  return "Sankalpa";
}

/** Resolves a row in `pricing_plans` for inserts/updates. Prefer the catalog UUID from the client. */
async function resolveTemplePricingPlanId(
  client: Pick<PoolClient, "query">,
  input: { catalogPlanId: string | null | undefined; planName: TemplePlan }
): Promise<string | null> {
  const uuid = (input.catalogPlanId ?? "").trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
    const r = await client.query<{ id: string }>(
      `SELECT id::text AS id FROM public.pricing_plans WHERE id = $1::uuid LIMIT 1`,
      [uuid]
    );
    if (r.rows[0]?.id) return r.rows[0]!.id;
  }
  const r2 = await client.query<{ id: string }>(
    `SELECT id::text AS id FROM public.pricing_plans
     WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1`,
    [input.planName]
  );
  if (r2.rows[0]?.id) return r2.rows[0]!.id;
  return null;
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

/**
 * Short label and canonical `*.omkaarya.com` host (aligns with billing `portal` construction).
 * Exported for seed data and tests.
 */
export function portalLabelAndHost(
  slug: string,
  domainSubdomain: string | null
): { subdomain: string; portalHost: string } {
  const raw = subdomainFromSlugAndDomain(slug, domainSubdomain);
  const label = raw
    .replace(/^https?:\/\//i, "")
    .replace(/\.omkaarya\.com$/i, "")
    .trim();
  const portalHost = label ? `${label}.omkaarya.com` : "";
  return { subdomain: label, portalHost };
}

export type SaveTempleProfileDetailsInput = {
  sessionEmail: string;
  websiteUrl: string;
  fax: PhoneRowJson;
  domainSubdomain: string;
  establishedYear: string;
  fullAddress: TempleFullAddressJson;
  logoDataUrl: string | null;
  charityRegistered: boolean;
  charityRegistrationNumber: string;
};

export class PostgresTempleRepository implements TempleRepository {
  private async assertTempleEmailsNotInUse(input: { adminEmail: string; templeEmail: string }): Promise<void> {
    const pool = requirePool();

    const normalize = (e: string) => e.trim().toLowerCase();
    const candidates = [normalize(input.adminEmail), normalize(input.templeEmail)].filter(Boolean);
    const unique = Array.from(new Set(candidates));
    if (unique.length === 0) return;

    const res = await pool.query<{
      tenant_id: string;
      admin_email: string;
      contact_email: string | null;
    }>(
      `SELECT tenant_id, admin_email, contact_email
       FROM public.temples
       WHERE lower(trim(admin_email)) = ANY($1)
          OR lower(trim(coalesce(contact_email, ''))) = ANY($1)`,
      [unique]
    );

    if (res.rows.length === 0) return;

    const conflicts: TempleEmailAlreadyInUseError["conflicts"] = [];
    for (const r of res.rows) {
      const admin = (r.admin_email ?? "").trim().toLowerCase();
      const contact = (r.contact_email ?? "").trim().toLowerCase();
      for (const e of unique) {
        if (admin && admin === e) {
          conflicts.push({ email: e, tenantId: r.tenant_id, matchedColumn: "admin_email" });
        }
        if (contact && contact === e) {
          conflicts.push({ email: e, tenantId: r.tenant_id, matchedColumn: "contact_email" });
        }
      }
    }

    if (conflicts.length > 0) {
      throw new TempleEmailAlreadyInUseError(conflicts);
    }
  }

  async listAll(): Promise<TempleRecord[]> {
    const pool = requirePool();
    const result = await pool.query<{
      tenant_id: string;
      name: string;
      slug: string;
      domain_subdomain: string | null;
      country_code: string;
      country_flag: string;
      city: string;
      plan: string;
      devotees: number;
      status: string;
      compliance: string;
      admin_email: string;
    }>(
      `SELECT tenant_id, name, slug, domain_subdomain, country_code, country_flag, city, plan, devotees, status, compliance, admin_email
       FROM public.temples
       ORDER BY tenant_id::int DESC`
    );
    return result.rows.map((r) => {
      const ph = portalLabelAndHost(r.slug, r.domain_subdomain);
      return {
        tenantId: r.tenant_id,
        name: r.name,
        slug: r.slug,
        subdomain: ph.subdomain,
        portalHost: ph.portalHost,
        countryCode: r.country_code,
        countryFlag: r.country_flag,
        city: r.city,
        plan: r.plan as TemplePlan,
        devotees: r.devotees,
        status: r.status as TempleStatus,
        compliance: r.compliance as TempleCompliance,
        adminEmail: r.admin_email,
      };
    });
  }

  async listPage(query: TemplesQueryInput): Promise<{
    data: TempleRecord[];
    total: number;
    totalAll: number;
    page: number;
    pageSize: number;
    totalPages: number;
    countries: string[];
  }> {
    const pool = requirePool();

    const q = (query.q ?? "").trim().toLowerCase();
    const status = query.status ?? "all";
    const country = (query.country ?? "all").trim();
    const pageSize = Number.isFinite(query.pageSize) && query.pageSize > 0 ? Math.floor(query.pageSize) : 10;
    const page = Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1;
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(
        `(LOWER(t.name) LIKE ${p} OR LOWER(t.city) LIKE ${p} OR LOWER(t.admin_email) LIKE ${p} OR LOWER(t.slug) LIKE ${p} OR LOWER(COALESCE(t.domain_subdomain, '')) LIKE ${p})`
      );
    }
    if (status !== "all") {
      params.push(status);
      where.push(`t.status = $${params.length}`);
    }
    if (country !== "all" && country) {
      params.push(country);
      where.push(`t.country_code = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const totalAllRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM public.temples`
    );
    const totalAll = totalAllRes.rows[0]?.total ?? 0;

    const countriesRes = await pool.query<{ country_code: string }>(
      `SELECT DISTINCT t.country_code
       FROM public.temples t
       ORDER BY t.country_code ASC`
    );
    const countries = countriesRes.rows.map((r) => r.country_code).filter(Boolean);

    const totalRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM public.temples t
       ${whereSql}`,
      params
    );
    const total = totalRes.rows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const safeOffset = (safePage - 1) * pageSize;

    const orderBy =
      query.sortBy === "name"
        ? `t.name ASC, t.tenant_id::int DESC`
        : query.sortBy === "devotees"
          ? `t.devotees DESC, t.tenant_id::int DESC`
          : `t.tenant_id::int DESC`;

    const dataRes = await pool.query<{
      tenant_id: string;
      name: string;
      slug: string;
      domain_subdomain: string | null;
      country_code: string;
      country_flag: string;
      city: string;
      plan: string;
      devotees: number;
      status: string;
      compliance: string;
      admin_email: string;
    }>(
      `SELECT tenant_id, name, slug, domain_subdomain, country_code, country_flag, city, plan, devotees, status, compliance, admin_email
       FROM public.temples t
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, safeOffset]
    );

    const data = dataRes.rows.map((r) => {
      const ph = portalLabelAndHost(r.slug, r.domain_subdomain);
      return {
        tenantId: r.tenant_id,
        name: r.name,
        slug: r.slug,
        subdomain: ph.subdomain,
        portalHost: ph.portalHost,
        countryCode: r.country_code,
        countryFlag: r.country_flag,
        city: r.city,
        plan: r.plan as TemplePlan,
        devotees: r.devotees,
        status: r.status as TempleStatus,
        compliance: r.compliance as TempleCompliance,
        adminEmail: r.admin_email,
      };
    });

    return {
      data,
      total,
      totalAll,
      page: safePage,
      pageSize,
      totalPages,
      countries,
    };
  }

  async getTempleSessionProfileByAdminEmail(adminEmail: string): Promise<TempleSessionProfileResponse | null> {
    const pool = requirePool();
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
      effective_pricing_plan_id: string | null;
      effective_pricing_plan_name: string | null;
      billing_cycle: string | null;
    }>(
      `SELECT temples.tenant_id, temples.name, temples.country_code, temples.city, temples.admin_email,
              temples.contact_email, temples.charity_registered, temples.charity_registration_number, temples.contact_phone,
              temples.website_url, temples.fax, temples.domain_subdomain, temples.established_year, temples.full_address, temples.logo_data_url,
              COALESCE(
                NULLIF(temples.pricing_plan_id::text, ''),
                (SELECT p2.id::text FROM public.pricing_plans p2
                 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(temples.plan)) LIMIT 1)
              ) AS effective_pricing_plan_id,
              COALESCE(
                pp.name,
                (SELECT p2.name FROM public.pricing_plans p2
                 WHERE LOWER(TRIM(p2.name)) = LOWER(TRIM(temples.plan)) LIMIT 1)
              ) AS effective_pricing_plan_name,
              temples.billing_cycle
       FROM public.temples
       LEFT JOIN public.pricing_plans pp ON pp.id = temples.pricing_plan_id
       WHERE ${sqlTempleMatchesSessionEmail(1)}
       LIMIT 1`,
      [email]
    );
    const row = result.rows[0];
    if (!row) return null;

    const contactEmail = (row.contact_email ?? row.admin_email).trim();
    const phone = parsePhoneJson(row.contact_phone);
    const bc = (row.billing_cycle ?? "").trim().toLowerCase();
    const billing: "monthly" | "annual" = bc === "monthly" ? "monthly" : "annual";

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
      provisioningPlan: {
        pricingPlanId:
          row.effective_pricing_plan_id && row.effective_pricing_plan_id.trim()
            ? row.effective_pricing_plan_id.trim()
            : null,
        planName:
          row.effective_pricing_plan_name && row.effective_pricing_plan_name.trim()
            ? row.effective_pricing_plan_name.trim()
            : null,
        billing,
      },
    };
  }

  async saveTempleProfileDetails(input: SaveTempleProfileDetailsInput): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    const pool = requirePool();
    const sessionEmail = input.sessionEmail.trim();
    const charityReg = input.charityRegistered;
    const charityNum = charityReg ? input.charityRegistrationNumber.trim() : null;
    const res = await pool.query<{ tenant_id: string }>(
      `UPDATE public.temples
       SET website_url = $2,
           fax = $3::jsonb,
           domain_subdomain = $4,
           established_year = $5,
           full_address = $6::jsonb,
           logo_data_url = $7,
           charity_registered = $8,
           charity_registration_number = $9
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
        charityReg,
        charityNum,
      ]
    );
    if (res.rows.length === 0) return { ok: false, reason: "not_found" };
    return { ok: true };
  }

  async createTemple(
    payload: CreateTemplePayload
  ): Promise<{ templeId: string; temporaryPassword?: string; invoice?: CreateInitialInvoiceResult }> {
    const pool = requirePool();

    await this.assertTempleEmailsNotInUse({
      adminEmail: payload.admin.email,
      templeEmail: payload.temple.email,
    });

    const [logoStoredUrl, adminProfileStoredUrl] = await Promise.all([
      storeBrandingImageIfNeeded(payload.logoTempleDataUrl, "temple-logo", "temple-logo"),
      storeBrandingImageIfNeeded(payload.adminProfileDataUrl, "admin-profile", "admin-profile"),
    ]);

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
      const slug = buildSlug(payload.temple.subdomain);
      const domainSubEarly = payload.temple.subdomain.trim() || null;
      const phEarly = portalLabelAndHost(slug, domainSubEarly);
      const row: TempleRecord = {
        tenantId,
        name: payload.temple.name.trim() || "Unnamed temple",
        slug,
        subdomain: phEarly.subdomain,
        portalHost: phEarly.portalHost,
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
      const domainSub = domainSubEarly;
      const tradition = payload.temple.tradition.trim() || null;
      const primaryDeity = payload.temple.deity.trim() || null;
      const billingCycle = payload.planBilling.billingCycle.trim() || null;
      const charityReg = payload.temple.charityRegistered === true;
      const charityNumber = charityReg ? payload.temple.charityRegistrationNumber.trim() : null;

      let temporaryPassword: string | undefined;
      let invoice: CreateInitialInvoiceResult | undefined;
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
              `INSERT INTO public.users (email, temp_password, full_name, whatsapp, roles, profile_image_url)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [row.adminEmail, temporaryPassword, adminFullName, adminWhatsapp, adminRoles, adminProfileStoredUrl]
            );
          } else if (existing.rows[0]!.password_hash != null) {
            // User already has a permanent password — do not reset password fields, but do overwrite profile fields.
            await client.query(
              `UPDATE public.users
               SET full_name = $1, whatsapp = $2, roles = $3,
                   profile_image_url = COALESCE($4, profile_image_url)
               WHERE email = $5`,
              [adminFullName, adminWhatsapp, adminRoles, adminProfileStoredUrl, row.adminEmail]
            );
          } else {
            temporaryPassword = generateTemporaryPassword();
            await client.query(
              `INSERT INTO public.users (email, temp_password, full_name, whatsapp, roles, profile_image_url)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (email) DO UPDATE
               SET temp_password = EXCLUDED.temp_password,
                   full_name = EXCLUDED.full_name,
                   whatsapp = EXCLUDED.whatsapp,
                   roles = EXCLUDED.roles,
                   profile_image_url = COALESCE(EXCLUDED.profile_image_url, public.users.profile_image_url)`,
              [row.adminEmail, temporaryPassword, adminFullName, adminWhatsapp, adminRoles, adminProfileStoredUrl]
            );
          }
          const idRes = await client.query<{ id: number }>(
            "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
            [row.adminEmail]
          );
          adminUserId = idRes.rows[0]?.id ?? null;
        }

        const pricingPlanIdResolved = await resolveTemplePricingPlanId(client, {
          catalogPlanId: payload.planBilling.selectedPricingPlanId,
          planName: row.plan,
        });

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
             $1, $2, $3, $4, $5, $6, $7, $8,
             $9, $10, $11, $12, $13,
             $14, $15, $16,
             $17::jsonb, $18::jsonb, $19::jsonb,
             $20, $21, $22, $23::jsonb,
             $24, $25, $26,
             $27
           )`,
          [
            row.tenantId,
            row.name,
            row.slug,
            row.countryCode,
            row.countryFlag,
            row.city,
            row.plan,
            pricingPlanIdResolved,
            row.devotees,
            row.status,
            row.compliance,
            row.adminEmail,
            adminUserId,
            contactEmail,
            charityReg,
            charityNumber,
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
            logoStoredUrl,
          ]
        );

        if (ADMIN_EMAIL_RE.test(row.adminEmail)) {
          await client.query(`UPDATE public.users SET tenant_id = $1 WHERE lower(trim(email)) = lower(trim($2))`, [
            row.tenantId,
            row.adminEmail,
          ]);
        }

        try {
          invoice = await createInitialInvoiceForNewTemple(client, {
            tenantId: row.tenantId,
            planName: row.plan,
            templeName: row.name,
            billingCycleRaw: billingCycle ?? "Annually",
            trial,
          });
        } catch (be) {
          console.error("[createTemple] billing invoice failed, rolling back temple transaction", be);
          throw be;
        }

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }

      return { templeId: row.tenantId, temporaryPassword, invoice };
    } finally {
      client.release();
    }
  }

  async getTempleForEdit(tenantId: string): Promise<SuperAdminTempleDetailResponse | null> {
    const pool = requirePool();
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
      charity_registered: boolean;
      charity_registration_number: string | null;
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
         t.charity_registered,
         t.charity_registration_number,
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
        charityRegistered: r.charity_registered === true,
        charityRegistrationNumber: (r.charity_registration_number ?? "").trim(),
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
    const pool = requirePool();
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
      const nextLogo: string | null =
        payload.logoTempleDataUrl !== undefined
          ? await storeBrandingImageIfNeeded(payload.logoTempleDataUrl, "temple-logo", "temple-logo")
          : existing.rows[0]!.logo_data_url;

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
      const charityReg = payload.temple.charityRegistered === true;
      const charityNumber = charityReg ? payload.temple.charityRegistrationNumber.trim() : null;

      const pricingPlanIdResolved = await resolveTemplePricingPlanId(client, {
        catalogPlanId: payload.planBilling.selectedPricingPlanId,
        planName: plan,
      });

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
               pricing_plan_id = $21,
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
               logo_data_url = $20,
               charity_registered = $22,
               charity_registration_number = $23
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
            pricingPlanIdResolved,
            charityReg,
            charityNumber,
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
