import type { ErrorRequestHandler } from "express";
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
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
