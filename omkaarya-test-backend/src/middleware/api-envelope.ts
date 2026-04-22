import type { Response } from "express";

/** Standard success body for all JSON APIs. */
export type ApiSuccessBody<T> = {
  success: true;
  message: string;
  reason: string;
  data: T;
};

/** Standard error body for all JSON APIs. */
export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    reason: string;
    details?: unknown;
  };
};

export function sendSuccess<T>(res: Response, status: number, data: T, message: string, reason: string): void {
  const body: ApiSuccessBody<T> = { success: true, message, reason, data };
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  reason: string,
  details?: unknown
): void {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message, reason, ...(details !== undefined ? { details } : {}) },
  };
  res.status(status).json(body);
}

/** Default `reason` copy when routes do not pass a custom one. */
export const DEFAULT_REASON: Record<number, (msg: string) => string> = {
  400: (m) => `The request was rejected: ${m}`,
  401: (m) => m || "Authentication is required or credentials were not accepted.",
  404: (m) => m || "No matching resource exists for the identifiers you provided.",
  409: (m) => m || "The current state of the system conflicts with this request.",
  500: (m) => `The server could not complete the operation: ${m}`,
};

export function defaultReasonForStatus(status: number, message: string): string {
  const fn = DEFAULT_REASON[status];
  return fn ? fn(message) : message;
}
