import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, z } from "zod";
import type { ApiErrorBody } from "./api-envelope.js";

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiErrorBody = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          reason:
            "The request body or query did not match the required shape. Correct the highlighted fields and try again.",
          details: parsed.error.flatten(),
        },
      };
      res.status(400).json(body);
      return;
    }
    req.body = parsed.data as z.infer<T>;
    next();
  };
}
