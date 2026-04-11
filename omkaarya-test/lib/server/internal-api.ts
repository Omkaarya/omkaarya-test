"use server";

import { getAppOrigin } from "@/lib/server/app-origin";

export type InternalApiErrorShape = {
  error?: string;
  message?: string;
};

export async function internalApiUrl(path: string): Promise<string> {
  const origin = await getAppOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

export async function fetchInternalApiJson<T>(
  path: string,
  init: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const url = await internalApiUrl(path);
  const res = await fetch(url, init);

  const data = (await res.json().catch(() => null)) as (T & InternalApiErrorShape) | null;
  if (res.ok && data !== null) {
    return { ok: true, data: data as T };
  }

  const message =
    (data && typeof data.error === "string" && data.error) ||
    (data && typeof data.message === "string" && data.message) ||
    (res.ok ? "Unexpected empty response." : "Request failed.");

  return { ok: false, status: res.status, message };
}

