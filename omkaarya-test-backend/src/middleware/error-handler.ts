import type { ErrorRequestHandler } from "express";
import { type ApiErrorBody, defaultReasonForStatus } from "./api-envelope.js";
import { HttpError } from "./http-error.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    if (err.statusCode >= 500) {
      console.error(err);
    }
    const message = err.message;
    const reason = err.reason ?? defaultReasonForStatus(err.statusCode, message);
    const body: ApiErrorBody = {
      success: false,
      error: { code: err.code, message, reason },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(err);
  const message = "Internal server error";
  const body: ApiErrorBody = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
      reason: "An unexpected error occurred while processing the request. Try again or contact support if it persists.",
    },
  };
  res.status(500).json(body);
};
