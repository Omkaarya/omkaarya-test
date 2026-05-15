/** Catalog entry shape for temple onboarding (loaded from `/api/temple-admin/deity-catalog`). */

export type DeityCatalogEntry = {
  id: string;
  name: string;
  /** e.g. "(Ganesha)" */
  secondaryLabel?: string;
  /** Tailwind gradient classes for placeholder card */
  placeholderHue: string;
  /** Optional persisted image (data URL or URL) */
  imageDataUrl?: string | null;
};

export function getDeityById(entries: DeityCatalogEntry[], id: string | null | undefined): DeityCatalogEntry | undefined {
  if (id == null || id === "") return undefined;
  return entries.find((d) => d.id === id);
}

export function filterDeitiesByQuery(entries: DeityCatalogEntry[], query: string): DeityCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((d) => {
    const hay = `${d.name} ${d.secondaryLabel ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}
