import {
  filterTemples,
  listCountries,
  paginateTemples,
  parseTemplesQuery,
  sortTemples,
} from "./temples.query.js";
import type { TempleRepository } from "./temples.repository.js";
import type { CreateTemplePayload, TemplesListResponse } from "./types.js";

export class TemplesService {
  constructor(private readonly repo: TempleRepository) {}

  async listTemples(searchParams: URLSearchParams): Promise<TemplesListResponse> {
    const query = parseTemplesQuery(searchParams);
    const allRows = await this.repo.listAll();
    const filtered = filterTemples(allRows, query);
    const sorted = sortTemples(filtered, query.sortBy);
    const paged = paginateTemples(sorted, query.page, query.pageSize);

    return {
      ...paged,
      totalAll: allRows.length,
      countries: listCountries(allRows),
    };
  }

  async createTemple(payload: CreateTemplePayload): Promise<{ templeId: string }> {
    return this.repo.createTemple(payload);
  }
}
