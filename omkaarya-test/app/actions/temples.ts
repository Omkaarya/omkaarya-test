"use server";

import type { TemplesListResponse } from "@/lib/temples-query";
import { fetchInternalApiJson } from "@/lib/server/internal-api";

export type ListTemplesActionResult =
  | { ok: true; data: TemplesListResponse }
  | { ok: false; status: number; message: string };

export async function listTemplesAction(params: {
  q: string;
  status: string;
  country: string;
  sortBy: string;
  page: number;
  pageSize: number;
}): Promise<ListTemplesActionResult> {
  const search = new URLSearchParams({
    q: params.q,
    status: params.status,
    country: params.country,
    sortBy: params.sortBy,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const res = await fetchInternalApiJson<TemplesListResponse>(`/api/temples?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (res.ok) return { ok: true, data: res.data };
  return { ok: false, status: res.status, message: res.message };
}

export type CreateTempleActionResult =
  | { ok: true; templeId: string; temporaryPassword?: string; message: string }
  | { ok: false; status: number; message: string };

export async function createTempleAction(payload: unknown): Promise<CreateTempleActionResult> {
  const res = await fetchInternalApiJson<{
    success: boolean;
    templeId?: string;
    temporaryPassword?: string;
    message?: string;
  }>("/api/temples/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const templeId = typeof res.data.templeId === "string" ? res.data.templeId : "";
    if (!templeId) {
      return { ok: false, status: 502, message: "Temple created, but response was missing templeId." };
    }
    return {
      ok: true,
      templeId,
      temporaryPassword: typeof res.data.temporaryPassword === "string" ? res.data.temporaryPassword : undefined,
      message: typeof res.data.message === "string" ? res.data.message : "Temple created successfully.",
    };
  }

  return { ok: false, status: res.status, message: res.message };
}

