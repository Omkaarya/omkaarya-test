import { normalizeTempleSubdomainLabel } from "@/lib/temple-subdomain";

export const OMKAARYA_PORTAL_SUFFIX = "omkaarya.com";

export type PlanFeatureRow = {
  featureKey: string;
  isEnabled: boolean;
};

export function buildOmkaaryaSubdomainHost(slug: string): string {
  const label = normalizeTempleSubdomainLabel(slug);
  return label ? `${label}.${OMKAARYA_PORTAL_SUFFIX}` : "";
}

/** True when the stored subdomain value is a full custom hostname (not an Omkaarya slug). */
export function isCustomDomainHostValue(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (!v) return false;
  if (v.endsWith(`.${OMKAARYA_PORTAL_SUFFIX}`)) return false;
  return v.includes(".");
}

/** Split API `temple.subdomain` into slug vs custom host for edit hydrate. */
export function splitTempleDomainFromApi(subdomainRaw: string): {
  slug: string;
  customDomain: string;
} {
  const raw = subdomainRaw.trim();
  if (!raw) return { slug: "", customDomain: "" };
  const lower = raw.toLowerCase();
  if (lower.endsWith(`.${OMKAARYA_PORTAL_SUFFIX}`)) {
    return { slug: normalizeTempleSubdomainLabel(raw), customDomain: "" };
  }
  if (isCustomDomainHostValue(raw)) {
    return { slug: "", customDomain: normalizeCustomDomainHost(raw) };
  }
  return { slug: normalizeTempleSubdomainLabel(raw), customDomain: "" };
}

/** Strip scheme/path and any Omkaarya portal suffix from user input (custom-domain field). */
export function stripOmkaaryaFromCustomDomainInput(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\.omkaarya\.com\/?$/i, "")
    .replace(new RegExp(`\\.${OMKAARYA_PORTAL_SUFFIX.replace(".", "\\.")}$`, "i"), "")
    .trim();
}

/** Normalize a bring-your-own hostname (no scheme/path). Returns "" if invalid. */
export function normalizeCustomDomainHost(raw: string): string {
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

export function planHasCustomDomain(
  features: PlanFeatureRow[] | null | undefined,
  catalogFeatureLabels?: string[] | null
): boolean {
  if ((features ?? []).some((f) => f.featureKey === "custom_domain" && f.isEnabled)) {
    return true;
  }
  return (catalogFeatureLabels ?? []).some((label) => /custom\s*domain/i.test(label));
}

export function resolvePortalPreview(params: {
  allowCustomDomain: boolean;
  slug: string;
  customDomain: string;
}): string {
  const { allowCustomDomain, slug, customDomain } = params;
  if (allowCustomDomain) {
    const host = normalizeCustomDomainHost(customDomain);
    if (host) return host;
  }
  const label = normalizeTempleSubdomainLabel(slug) || "temple_name";
  return buildOmkaaryaSubdomainHost(label) || `${label}.${OMKAARYA_PORTAL_SUFFIX}`;
}

/** Hint under the domain field — fallback to default subdomain if custom domain is blank. */
export function domainFieldHint(params: {
  allowCustomDomain: boolean;
  slug: string;
  customDomain: string;
}): string {
  if (params.allowCustomDomain) {
    const host = normalizeCustomDomainHost(params.customDomain);
    if (host) {
      return `Microsite will be live at: ${host}`;
    }
    const fallback = buildOmkaaryaSubdomainHost(params.slug) || `${params.slug || "your-temple"}.${OMKAARYA_PORTAL_SUFFIX}`;
    return `Enter your own domain (e.g. bookings.mytemple.org), or leave blank to use the default subdomain: ${fallback}`;
  }
  const host = resolvePortalPreview(params);
  return `Microsite will be live at: ${host || "your-temple.omkaarya.com"}`;
}

/** Value sent as `temple.subdomain` in create/update payloads. */
export function templeSubdomainPayloadValue(params: {
  allowCustomDomain: boolean;
  slug: string;
  customDomain: string;
}): string {
  if (params.allowCustomDomain) {
    const custom = normalizeCustomDomainHost(params.customDomain);
    if (custom) return custom;
  }
  return normalizeTempleSubdomainLabel(params.slug);
}
