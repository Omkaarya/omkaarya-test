import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requirePool } from "../db/pool.js";

const OMKAARYA_PORTAL_SUFFIX = "omkaarya.com";

function normalizeTempleSubdomainLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\.omkaarya\.com$/i, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

function templeSubdomainToSlugColumn(subdomainLabel: string): string {
  const label = normalizeTempleSubdomainLabel(subdomainLabel);
  if (!label) return "temple.omkaarya.com";
  return `${label}.omkaarya.com`;
}

function stripOmkaaryaFromCustomDomainInput(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\.omkaarya\.com\/?$/i, "")
    .replace(new RegExp(`\\.${OMKAARYA_PORTAL_SUFFIX.replace(".", "\\.")}$`, "i"), "")
    .trim();
}

function normalizeCustomDomainHost(raw: string): string {
  let v = stripOmkaaryaFromCustomDomainInput(raw).toLowerCase();
  if (!v) return "";
  v = v.replace(/:\d+$/, "");
  if (v.includes(" ") || v.includes("@")) return "";
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(v)) {
    return "";
  }
  if (v === OMKAARYA_PORTAL_SUFFIX || v.endsWith(`.${OMKAARYA_PORTAL_SUFFIX}`)) return "";
  return v.slice(0, 253);
}

function buildOmkaaryaSubdomainHost(slug: string): string {
  const label = normalizeTempleSubdomainLabel(slug);
  return label ? `${label}.${OMKAARYA_PORTAL_SUFFIX}` : "";
}

async function isTempleSubdomainTaken(subdomainLabel: string, excludeTenantId?: string): Promise<boolean> {
  const label = normalizeTempleSubdomainLabel(subdomainLabel);
  if (!label) return false;
  const slugForm = templeSubdomainToSlugColumn(label);
  const pool = requirePool();
  const result = await pool.query<{ ok: number }>(
    `SELECT 1 AS ok
     FROM public.temples
     WHERE (
       LOWER(TRIM(COALESCE(domain_subdomain, ''))) = $1
       OR LOWER(TRIM(slug)) = $1
       OR LOWER(TRIM(slug)) = $2
     )
     AND ($3::text IS NULL OR tenant_id::text <> $3)
     LIMIT 1`,
    [label, slugForm.toLowerCase(), excludeTenantId?.trim() || null]
  );
  return result.rows.length > 0;
}

async function isTempleCustomHostTaken(hostRaw: string, excludeTenantId?: string): Promise<boolean> {
  const host = normalizeCustomDomainHost(hostRaw);
  if (!host) return false;
  const pool = requirePool();
  const result = await pool.query<{ ok: number }>(
    `SELECT 1 AS ok
     FROM public.temples
     WHERE (
       LOWER(TRIM(COALESCE(domain_subdomain, ''))) = $1
       OR LOWER(TRIM(slug)) = $1
     )
     AND ($2::text IS NULL OR tenant_id::text <> $2)
     LIMIT 1`,
    [host, excludeTenantId?.trim() || null]
  );
  return result.rows.length > 0;
}

/** GET /api/temples/check-subdomain — super-admin availability probe. */
export function createTempleSubdomainCheckRouter(): Router {
  const r = Router();

  r.get(
    "/temples/check-subdomain",
    asyncHandler(async (req, res) => {
      const excludeTenantId =
        typeof req.query.excludeTenantId === "string" ? req.query.excludeTenantId.trim() : undefined;
      const hostParam = typeof req.query.host === "string" ? req.query.host.trim() : "";

      if (hostParam) {
        const host = normalizeCustomDomainHost(hostParam);
        if (!host) {
          sendSuccess(
            res,
            200,
            { available: false, host: "" },
            "Invalid hostname",
            "Enter a valid domain such as bookings.mytemple.org."
          );
          return;
        }
        const taken = await isTempleCustomHostTaken(host, excludeTenantId);
        sendSuccess(
          res,
          200,
          { available: !taken, host },
          taken ? "Hostname taken" : "Hostname available",
          taken ? `Another temple already uses "${host}".` : `"${host}" is available.`
        );
        return;
      }

      const subdomain = normalizeTempleSubdomainLabel(
        typeof req.query.subdomain === "string" ? req.query.subdomain : ""
      );

      if (!subdomain) {
        sendSuccess(
          res,
          200,
          { available: false, subdomain: "" },
          "Invalid subdomain",
          "Provide a subdomain label."
        );
        return;
      }

      const taken = await isTempleSubdomainTaken(subdomain, excludeTenantId);
      const displayHost = buildOmkaaryaSubdomainHost(subdomain);
      sendSuccess(
        res,
        200,
        { available: !taken, subdomain },
        taken ? "Subdomain taken" : "Subdomain available",
        taken
          ? `Another temple already uses "${displayHost}".`
          : `"${displayHost}" is available.`
      );
    })
  );

  return r;
}
