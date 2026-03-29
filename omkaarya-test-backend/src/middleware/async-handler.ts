import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Ensures rejected promises and sync throws from async route handlers reach the error middleware.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
