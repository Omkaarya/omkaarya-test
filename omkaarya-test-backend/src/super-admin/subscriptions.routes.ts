import { Router } from "express";
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
        res.json(payload);
      } catch (e) {
        throw new HttpError(500, "Failed to load subscriptions", { cause: e });
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
          res.status(404).json({ error: "Subscription not found." });
          return;
        }
        res.json({ success: true });
      } catch (e) {
        throw new HttpError(500, "Failed to verify subscription", { cause: e });
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
          res.status(404).json({ error: "Subscription not found." });
          return;
        }
        res.json({ success: true });
      } catch (e) {
        throw new HttpError(500, "Failed to reject subscription", { cause: e });
      }
    })
  );

  return r;
}
