import type { RequestHandler } from "express";
import { HttpError } from "../../middleware/http-error.js";
import type { TempleSessionLocals } from "../../temple-ops/middleware/require-temple-jwt.js";

/** Rejects requests where `sessionEmail` does not match the verified temple JWT session. */
export const enforceTempleSessionEmail: RequestHandler = (req, _res, next) => {
  const session = (_res.locals as { templeSession?: TempleSessionLocals }).templeSession;
  if (!session?.email) {
    next(
      new HttpError(401, "Temple session required.", {
        code: "UNAUTHORIZED",
        reason: "Sign in with a temple administrator account to continue.",
      })
    );
    return;
  }

  const sessionEmailLower = session.email.trim().toLowerCase();
  const queryEmail =
    typeof req.query.sessionEmail === "string" ? req.query.sessionEmail.trim().toLowerCase() : "";
  if (queryEmail && queryEmail !== sessionEmailLower) {
    next(
      new HttpError(403, "Session email mismatch.", {
        code: "FORBIDDEN",
        reason: "The sessionEmail query parameter does not match the authenticated user.",
      })
    );
    return;
  }

  const body = req.body as { sessionEmail?: string } | undefined;
  const bodyEmail = typeof body?.sessionEmail === "string" ? body.sessionEmail.trim().toLowerCase() : "";
  if (bodyEmail && bodyEmail !== sessionEmailLower) {
    next(
      new HttpError(403, "Session email mismatch.", {
        code: "FORBIDDEN",
        reason: "The sessionEmail field does not match the authenticated user.",
      })
    );
    return;
  }

  next();
};
