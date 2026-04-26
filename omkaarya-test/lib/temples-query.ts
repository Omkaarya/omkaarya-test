import type { MockTemple, TempleStatus } from "@/lib/mock-temples";

export type TemplesSortBy = "last7" | "name" | "devotees";

export type TemplesQueryInput = {
  q: string;
  status: "all" | TempleStatus;
  country: "all" | string;
  sortBy: TemplesSortBy;
  page: number;
  pageSize: number;
};

export type TemplesListResponse = {
  data: MockTemple[];
  total: number;
  totalAll: number;
  page: number;
  pageSize: number;
  totalPages: number;
  countries: string[];
};

const ALLOWED_SORTS: TemplesSortBy[] = ["last7", "name", "devotees"];
const ALLOWED_PAGE_SIZES = [10, 25, 50];

export function parseTemplesQuery(searchParams: URLSearchParams): TemplesQueryInput {
  const q = (searchParams.get("q") ?? "").trim();
  const rawStatus = (searchParams.get("status") ?? "all").trim();
  const status: TemplesQueryInput["status"] =
    rawStatus === "Active" || rawStatus === "Trial" || rawStatus === "Suspended"
      ? rawStatus
      : "all";

  const rawCountry = (searchParams.get("country") ?? "all").trim();
  const country = rawCountry || "all";

  const rawSort = (searchParams.get("sortBy") ?? "last7").trim() as TemplesSortBy;
  const sortBy = ALLOWED_SORTS.includes(rawSort) ? rawSort : "last7";

  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const rawPageSize = Number(searchParams.get("pageSize") ?? "10");
  const pageSize = ALLOWED_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 10;

  return { q, status, country, sortBy, page, pageSize };
}

export function filterTemples(rows: MockTemple[], query: TemplesQueryInput): MockTemple[] {
  let filtered = [...rows];

  if (query.q) {
    const term = query.q.toLowerCase();
    filtered = filtered.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.city.toLowerCase().includes(term) ||
        row.adminEmail.toLowerCase().includes(term) ||
        row.slug.toLowerCase().includes(term) ||
        row.subdomain.toLowerCase().includes(term) ||
        row.portalHost.toLowerCase().includes(term)
    );
  }

  if (query.status !== "all") {
    filtered = filtered.filter((row) => row.status === query.status);
  }

  if (query.country !== "all") {
    filtered = filtered.filter((row) => row.countryCode === query.country);
  }

  return filtered;
}

export function sortTemples(rows: MockTemple[], sortBy: TemplesSortBy): MockTemple[] {
  const sorted = [...rows];

  if (sortBy === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  if (sortBy === "devotees") {
    sorted.sort((a, b) => b.devotees - a.devotees);
    return sorted;
  }

  sorted.sort((a, b) => Number(b.tenantId) - Number(a.tenantId));
  return sorted;
}

export function paginateTemples(rows: MockTemple[], page: number, pageSize: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function listCountries(rows: MockTemple[]): string[] {
  return Array.from(new Set(rows.map((row) => row.countryCode))).sort();
}
