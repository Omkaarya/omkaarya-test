import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api-base";
import { nextJsonError } from "@/lib/api-envelope";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const res = await fetch(apiUrl("/api/temples/create"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg =
        data && typeof data === "object" && "error" in data
          ? (data as { error: { message?: string } | string }).error
          : data;
      console.error("Temple create proxy: backend", res.status, errMsg);
    }
    return NextResponse.json(
      data ?? { success: false, error: { code: "EMPTY_RESPONSE", message: "Empty response", reason: "The backend returned no parseable JSON body." } },
      { status: res.status }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Temple create error (proxy fetch failed – is the API running on the configured base URL?)", error);
    return nextJsonError(
      502,
      "UPSTREAM_UNREACHABLE",
      "Failed to reach the API server",
      `Could not connect to the backend: ${msg}. Check that the API is running (default http://localhost:4000) and NEXT_PUBLIC_API_BASE_URL.`
    );
  }
}
