import {
  buildOmkaaryaSubdomainHost,
  isCustomDomainHostValue,
  normalizeCustomDomainHost,
  OMKAARYA_PORTAL_SUFFIX,
} from "@/lib/temple-portal-domain";
import { normalizeTempleSubdomainLabel } from "@/lib/temple-subdomain";

/**
 * Mirrors backend `temples.repository` `subdomainFromSlugAndDomain` + `portalLabelAndHost`
 * for direct-PG reads (e.g. `temples-db`) so portal URLs match GET /api/temples.
 */
function subdomainFromSlugAndDomain(slug: string, domainSubdomain: string | null | undefined): string {
  const d = (domainSubdomain ?? "").trim();
  if (d) return d;
  const s = slug.trim();
  return s.replace(/\.omkaarya\.com$/i, "").replace(/^https?:\/\//i, "");
}

export function portalLabelAndHost(
  slug: string,
  domainSubdomain: string | null | undefined
): { subdomain: string; portalHost: string } {
  const raw = subdomainFromSlugAndDomain(slug, domainSubdomain)
    .replace(/^https?:\/\//i, "")
    .trim();

  if (raw && isCustomDomainHostValue(raw)) {
    const host = normalizeCustomDomainHost(raw) || raw;
    return { subdomain: host, portalHost: host };
  }

  const label = raw.replace(/\.omkaarya\.com$/i, "").trim();
  const portalHost = label ? buildOmkaaryaSubdomainHost(label) : "";
  return { subdomain: label, portalHost };
}

export { OMKAARYA_PORTAL_SUFFIX };
