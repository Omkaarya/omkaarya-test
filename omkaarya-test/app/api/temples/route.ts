import { NextRequest, NextResponse } from "next/server";
import { MOCK_TEMPLES } from "@/lib/mock-temples";
import {
  filterTemples,
  listCountries,
  paginateTemples,
  parseTemplesQuery,
  sortTemples,
  type TemplesListResponse,
} from "@/lib/temples-query";

export async function GET(request: NextRequest) {
  const query = parseTemplesQuery(request.nextUrl.searchParams);
  const filtered = filterTemples(MOCK_TEMPLES, query);
  const sorted = sortTemples(filtered, query.sortBy);
  const paged = paginateTemples(sorted, query.page, query.pageSize);

  const payload: TemplesListResponse = {
    ...paged,
    totalAll: MOCK_TEMPLES.length,
    countries: listCountries(MOCK_TEMPLES),
  };

  return NextResponse.json(payload);
}
