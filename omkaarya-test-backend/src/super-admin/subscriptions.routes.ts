import { Router } from "express";
import { sendError, sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresSubscriptionsRepository, SubscriptionStatus } from "./subscriptions.repository.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "";
}

function parseStatus(raw: string): "All" | SubscriptionStatus {
  const s = raw.trim();
  if (s === "Pending" || s === "Active" || s === "Expired" || s === "Rejected") return s;
  return "All";
}

export function createSubscriptionsRouter(repo: PostgresSubscriptionsRepository): Router {
  const r = Router();

  r.get(
    "/subscriptions",
    asyncHandler(async (req, res) => {
      try {
        const q = asString(req.query.q);
        const status = parseStatus(asString(req.query.status));
        const page = Number.parseInt(asString(req.query.page) || "1", 10);
        const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);

        const payload = await repo.list({
          q,
          status,
          page: Number.isFinite(page) ? page : 1,
          pageSize: Number.isFinite(pageSize) ? pageSize : 10,
        });
        sendSuccess(
          res,
          200,
          payload,
          "Subscriptions list loaded",
          "Subscriptions are paged and filtered in line with the finance UI query parameters."
        );
      } catch (e) {
        throw new HttpError(500, "Failed to load subscriptions", {
          cause: e,
          code: "SUBSCRIPTIONS_LIST_FAILED",
          reason: "The database query for paged subscriptions failed; check server logs.",
        });
      }
    })
  );

  r.post(
    "/subscriptions/:id/verify",
    asyncHandler(async (req, res) => {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      try {
        const out = await repo.verify(id, "Super Admin");
        if (!out.ok) {
          sendError(
            res,
            404,
            "SUBSCRIPTION_NOT_FOUND",
            "Subscription not found.",
            "The id does not match a row in `subscriptions`, or the row was already removed."
          );
          return;
        }
        sendSuccess(
          res,
          200,
          { verified: true },
          "Subscription verified",
          "The row was moved to an active state and verification metadata was recorded."
        );
      } catch (e) {
        throw new HttpError(500, "Failed to verify subscription", {
          cause: e,
          code: "SUBSCRIPTION_VERIFY_FAILED",
          reason: "The verify update could not be completed; see server logs.",
        });
      }
    })
  );

  r.post(
    "/subscriptions/:id/reject",
    asyncHandler(async (req, res) => {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      try {
        const out = await repo.reject(id, "Super Admin");
        if (!out.ok) {
          sendError(
            res,
            404,
            "SUBSCRIPTION_NOT_FOUND",
            "Subscription not found.",
            "The id does not match a row in `subscriptions`, or the row was already removed."
          );
          return;
        }
        sendSuccess(
          res,
          200,
          { rejected: true },
          "Subscription rejected",
          "The row was updated to a rejected state and audit metadata was recorded."
        );
      } catch (e) {
        throw new HttpError(500, "Failed to reject subscription", {
          cause: e,
          code: "SUBSCRIPTION_REJECT_FAILED",
          reason: "The reject update could not be completed; see server logs.",
        });
      }
    })
  );

  return r;
}
