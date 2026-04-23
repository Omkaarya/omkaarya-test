import {
  filterTemples,
  listCountries,
  paginateTemples,
  parseTemplesQuery,
  sortTemples,
} from "./temples.query.js";
import type { CreateInitialInvoiceResult } from "./billing.repository.js";
import type { TempleRepository } from "./temples.repository.js";
import type {
  CreateTemplePayload,
  SuperAdminTempleDetailResponse,
  TemplesListResponse,
  UpdateTemplePayload,
} from "./types.js";

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

  async createTemple(
    payload: CreateTemplePayload
  ): Promise<{ templeId: string; temporaryPassword?: string; invoice?: CreateInitialInvoiceResult }> {
    return this.repo.createTemple(payload);
  }

  async getTempleForEdit(tenantId: string): Promise<SuperAdminTempleDetailResponse | null> {
    return this.repo.getTempleForEdit(tenantId);
  }

  async updateTemple(
    tenantId: string,
    payload: UpdateTemplePayload
  ): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
    return this.repo.updateTemple(tenantId, payload);
  }
}
