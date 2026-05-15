/** Normalize user input to a portal subdomain label (no `.omkaarya.com`). */
export function normalizeTempleSubdomainLabel(raw: string): string {
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

/** Derive a subdomain slug from a temple display name. */
export function templeNameToSubdomainSlug(templeName: string): string {
  return normalizeTempleSubdomainLabel(templeName);
}

export function templeSubdomainToSlugColumn(subdomainLabel: string): string {
  const label = normalizeTempleSubdomainLabel(subdomainLabel);
  if (!label) return "temple.omkaarya.com";
  return `${label}.omkaarya.com`;
}
