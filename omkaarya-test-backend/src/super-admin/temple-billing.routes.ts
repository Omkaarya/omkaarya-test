import { Router } from "express";
import { sendSuccess, sendError } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { listOpenInvoicesForTempleSession } from "./billing.repository.js";
import type { TempleSessionLocals } from "../temple-ops/middleware/require-temple-jwt.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "";
}

export function createTempleBillingRouter(): Router {
  const r = Router();

  r.get(
    "/temple-admin/billing/invoices",
    asyncHandler(async (req, res) => {
      const session = (res.locals as { templeSession?: TempleSessionLocals }).templeSession;
      const sessionEmail = asString(req.query.sessionEmail) || session?.email || "";
      const templeId = asString(req.query.templeId) || session?.tenantId || "";
      if (!sessionEmail || !templeId) {
        sendError(res, 400, "VALIDATION_ERROR", "sessionEmail and templeId are required.", "Missing query parameters.");
        return;
      }
      const data = await listOpenInvoicesForTempleSession({ sessionEmail, templeId });
      sendSuccess(res, 200, { data }, "Open invoices", "Pending payable invoices for the logged-in temple.");
    })
  );

  return r;
}
