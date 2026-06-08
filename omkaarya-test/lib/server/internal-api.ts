"use server";

import { cookies } from "next/headers";
import { getAppOrigin } from "@/lib/server/app-origin";
import type { ApiErrorBody, ApiSuccessBody } from "@/lib/api-envelope";

export type InternalApiErrorShape = {
  error?: string;
  message?: string;
};

export type FetchInternalResult<T> =
  | { ok: true; data: T; message?: string; reason?: string }
  | { ok: false; status: number; message: string; code?: string; reason?: string };

function parseErrorMessage(body: unknown): { message: string; code?: string; reason?: string } {
  if (body && typeof body === "object" && "success" in body && (body as { success: boolean }).success === false) {
    const err = (body as ApiErrorBody).error;
    if (err && typeof err === "object") {
      return {
        message: typeof err.message === "string" ? err.message : "Request failed.",
        code: typeof err.code === "string" ? err.code : undefined,
        reason: typeof err.reason === "string" ? err.reason : undefined,
      };
    }
  }
  const legacy = body as InternalApiErrorShape | null;
  return {
    message:
      (legacy && typeof legacy.error === "string" && legacy.error) ||
      (legacy && typeof legacy.message === "string" && legacy.message) ||
      "Request failed.",
  };
}

export async function internalApiUrl(path: string): Promise<string> {
  const origin = await getAppOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

async function cookieHeaderFromRequest(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

export async function fetchInternalApiJson<T>(path: string, init: RequestInit): Promise<FetchInternalResult<T>> {
  const url = await internalApiUrl(path);
  const cookieHeader = await cookieHeaderFromRequest();
  const headers = new Headers(init.headers ?? undefined);
  if (cookieHeader && !headers.has("cookie")) {
    headers.set("cookie", cookieHeader);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  const body = (await res.json().catch(() => null)) as unknown;
  if (res.ok && body !== null) {
    if (typeof body === "object" && "success" in body && (body as { success: boolean }).success === true) {
      const env = body as ApiSuccessBody<T>;
      if ("data" in env) {
        return {
          ok: true,
          data: env.data,
          message: typeof env.message === "string" ? env.message : undefined,
          reason: typeof env.reason === "string" ? env.reason : undefined,
        };
      }
    }
    return { ok: true, data: body as T };
  }

  if (!res.ok) {
    const { message, code, reason } = parseErrorMessage(body);
    return { ok: false, status: res.status, message, code, reason };
  }

  return { ok: false, status: res.status, message: "Unexpected empty response." };
}

