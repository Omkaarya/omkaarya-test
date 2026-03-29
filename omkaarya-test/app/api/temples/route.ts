import { NextRequest, NextResponse } from "next/server";
import { fetchTemplesFromDb } from "@/lib/temples-db";
import {
  filterTemples,
  listCountries,
  paginateTemples,
  parseTemplesQuery,
  sortTemples,
  type TemplesListResponse,
} from "@/lib/temples-query";

export async function GET(request: NextRequest) {
  try {
    const allRows = await fetchTemplesFromDb();
    const query = parseTemplesQuery(request.nextUrl.searchParams);
    const filtered = filterTemples(allRows, query);
    const sorted = sortTemples(filtered, query.sortBy);
    const paged = paginateTemples(sorted, query.page, query.pageSize);

    const payload: TemplesListResponse = {
      ...paged,
      totalAll: allRows.length,
      countries: listCountries(allRows),
    };

    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load temples";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
