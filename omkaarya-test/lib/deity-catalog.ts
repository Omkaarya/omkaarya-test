/** Static catalog for temple onboarding deity selection (session-only until API exists). */

export type DeityCatalogEntry = {
  id: string;
  name: string;
  /** e.g. "(Ganesha)" */
  secondaryLabel?: string;
  /** Placeholder gradient / initials; no external assets required */
  placeholderHue: string;
};

export const DEITY_CATALOG: DeityCatalogEntry[] = [
  { id: "pillaiyaar", name: "Pillaiyaar", secondaryLabel: "(Ganesha)", placeholderHue: "from-amber-400 to-orange-500" },
  { id: "murugan", name: "Murugan", placeholderHue: "from-emerald-500 to-teal-600" },
  { id: "shivan", name: "Shivan", placeholderHue: "from-slate-500 to-zinc-600" },
  { id: "guruvayurappan", name: "Guruvayurappan", placeholderHue: "from-rose-400 to-pink-600" },
  { id: "amman", name: "Amman", placeholderHue: "from-fuchsia-500 to-purple-600" },
  { id: "aanjaneyar", name: "Aanjaneyar", placeholderHue: "from-orange-500 to-red-600" },
];

export function getDeityById(id: string): DeityCatalogEntry | undefined {
  return DEITY_CATALOG.find((d) => d.id === id);
}

export function filterDeitiesByQuery(query: string): DeityCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return DEITY_CATALOG;
  return DEITY_CATALOG.filter((d) => {
    const hay = `${d.name} ${d.secondaryLabel ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}
