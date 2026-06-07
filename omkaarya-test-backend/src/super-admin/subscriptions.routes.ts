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

  r.get(
    "/subscriptions/upcoming-renewals",
    asyncHandler(async (req, res) => {
      try {
        const q = asString(req.query.q);
        const days = Number.parseInt(asString(req.query.days) || "30", 10);
        const page = Number.parseInt(asString(req.query.page) || "1", 10);
        const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
        const payload = await repo.listUpcomingRenewals({
          q,
          days: Number.isFinite(days) ? days : 30,
          page: Number.isFinite(page) ? page : 1,
          pageSize: Number.isFinite(pageSize) ? pageSize : 10,
        });
        sendSuccess(
          res,
          200,
          payload,
          "Upcoming renewals loaded",
          "Active subscriptions expiring in the selected window."
        );
      } catch (e) {
        throw new HttpError(500, "Failed to load upcoming renewals", {
          cause: e,
          code: "UPCOMING_RENEWALS_FAILED",
          reason: "The database query for upcoming renewals failed; check server logs.",
        });
      }
    })
  );

  r.post(
    "/subscriptions/:id/verify",
    asyncHandler(async (req, res) => {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      const session = (
        res.locals as { superAdminSession?: { email: string } }
      ).superAdminSession;
      const verifiedBy = session?.email?.trim() || "Super Admin";
      try {
        const out = await repo.verify(id, verifiedBy);
        if (!out.ok) {
          if (out.reason === "invalid_state") {
            sendError(
              res,
              409,
              "INVALID_STATE",
              "Subscription cannot be verified.",
              "Only pending subscriptions can be verified."
            );
            return;
          }
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

  r.patch(
    "/subscriptions/:id",
    asyncHandler(async (req, res) => {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      const body = (req.body ?? {}) as { action?: string; months?: number; pricingPlanId?: string };

      if (body.action === "extend") {
        const months = Number(body.months);
        if (!Number.isFinite(months) || months < 1) {
          sendError(
            res,
            400,
            "VALIDATION_ERROR",
            "Invalid extension period.",
            "Provide months as a positive number (e.g. 6, 12, or 24)."
          );
          return;
        }
        try {
          const out = await repo.extend(id, months);
          if (!out.ok) {
            sendError(res, 404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.", "No row matches this id.");
            return;
          }
          sendSuccess(
            res,
            200,
            { extended: true, expiresOn: out.expiresOn },
            "Subscription extended",
            "The expiry date was moved forward by the requested number of months."
          );
        } catch (e) {
          throw new HttpError(500, "Failed to extend subscription", {
            cause: e,
            code: "SUBSCRIPTION_EXTEND_FAILED",
            reason: "The extend update could not be completed; see server logs.",
          });
        }
        return;
      }

      if (body.action === "changePlan") {
        const pricingPlanId = typeof body.pricingPlanId === "string" ? body.pricingPlanId.trim() : "";
        if (!pricingPlanId) {
          sendError(
            res,
            400,
            "VALIDATION_ERROR",
            "pricingPlanId is required.",
            "Provide the catalog pricing plan id to assign."
          );
          return;
        }
        try {
          const out = await repo.changePlan(id, pricingPlanId);
          if (!out.ok) {
            if (out.reason === "invalid_plan") {
              sendError(res, 400, "INVALID_PLAN", "Invalid pricing plan.", "The pricingPlanId is not in pricing_plans.");
              return;
            }
            sendError(res, 404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.", "No row matches this id.");
            return;
          }
          sendSuccess(
            res,
            200,
            { plan: out.plan },
            "Plan updated",
            "Subscription and temple rows were updated to the selected catalog plan."
          );
        } catch (e) {
          throw new HttpError(500, "Failed to change subscription plan", {
            cause: e,
            code: "SUBSCRIPTION_CHANGE_PLAN_FAILED",
            reason: "The plan update could not be completed; see server logs.",
          });
        }
        return;
      }

      sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Unsupported action.",
        'Use action "extend" with months, or action "changePlan" with pricingPlanId.'
      );
    })
  );

  r.post(
    "/subscriptions/:id/reject",
    asyncHandler(async (req, res) => {
      const id = typeof req.params.id === "string" ? req.params.id : "";
      const session = (
        res.locals as { superAdminSession?: { email: string } }
      ).superAdminSession;
      const verifiedBy = session?.email?.trim() || "Super Admin";
      try {
        const out = await repo.reject(id, verifiedBy);
        if (!out.ok) {
          if (out.reason === "invalid_state") {
            sendError(
              res,
              409,
              "INVALID_STATE",
              "Subscription cannot be rejected.",
              "Only pending subscriptions can be rejected."
            );
            return;
          }
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
