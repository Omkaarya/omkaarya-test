import { NextResponse } from "next/server";

/** Mirror of the Express `ApiErrorBody` / `ApiSuccessBody` contract for same-origin `app/api` routes. */
export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    reason: string;
    details?: unknown;
  };
};

export type ApiSuccessBody<T> = {
  success: true;
  message: string;
  reason: string;
  data: T;
};

export function nextJsonError(
  status: number,
  code: string,
  message: string,
  reason: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    success: false,
    error: {
      code,
      message,
      reason,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}

export function nextJsonSuccess<T>(status: number, data: T, message: string, reason: string): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ success: true, message, reason, data }, { status });
}

export function isApiEnvelope(
  v: unknown
): v is ApiSuccessBody<unknown> | ApiErrorBody {
  return (
    v !== null &&
    typeof v === "object" &&
    "success" in v &&
    typeof (v as { success: unknown }).success === "boolean"
  );
}

/** Read `error.message` from a standard error body, or a legacy `error` string. */
export function jsonApiErrorMessage(raw: unknown): string | undefined {
  if (raw === null || typeof raw !== "object" || !("error" in raw)) return undefined;
  const e = (raw as { error: unknown }).error;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  return undefined;
}
