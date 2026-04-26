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
  const raw = subdomainFromSlugAndDomain(slug, domainSubdomain);
  const label = raw
    .replace(/^https?:\/\//i, "")
    .replace(/\.omkaarya\.com$/i, "")
    .trim();
  const portalHost = label ? `${label}.omkaarya.com` : "";
  return { subdomain: label, portalHost };
}
