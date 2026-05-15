import { Router } from "express";
import { sendSuccess } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../middleware/http-error.js";
import type { PostgresDeleteAccountRequestsRepository } from "./delete-account-requests.repository.js";

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

function asQueryString(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return String(v[0] ?? "");
  return String(v);
}

function parseIntParam(v: string, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parseStatus(raw: string): "All" | "Pending" | "Approved" | "Rejected" {
  if (raw === "Pending" || raw === "Approved" || raw === "Rejected" || raw === "All") {
    return raw;
  }
  return "All";
}

export function createDeleteAccountRequestsRouter(
  repo: PostgresDeleteAccountRequestsRepository
): Router {
  const r = Router();

  r.get(
    "/super-admin/delete-account-requests",
    asyncHandler(async (req, res) => {
      const page = parseIntParam(asQueryString(req.query.page) || "1", 1, 1, 10_000);
      const pageSize = parseIntParam(asQueryString(req.query.pageSize) || "10", 10, 1, 100);
      const q = asQueryString(req.query.q);
      const status = parseStatus(asQueryString(req.query.status) || "All");

      const data = await repo.listPaged({ q, status, page, pageSize });
      sendSuccess(
        res,
        200,
        data,
        "Delete requests loaded",
        "Paginated delete-account requests returned."
      );
    })
  );

  r.patch(
    "/super-admin/delete-account-requests/:id",
    asyncHandler(async (req, res) => {
      const id = asSingleParam(req.params.id)?.trim();
      if (!id) {
        throw new HttpError(400, "Missing id", {
          code: "VALIDATION_ERROR",
          reason: "Request path must include a request id.",
        });
      }

      const status = (req.body as { status?: string })?.status;
      if (status !== "Approved" && status !== "Rejected") {
        throw new HttpError(400, "Invalid status", {
          code: "VALIDATION_ERROR",
          reason: 'Body.status must be "Approved" or "Rejected".',
        });
      }

      const result = await repo.updateStatus(id, status);
      if (!result.ok) {
        if (result.reason === "not_found") {
          throw new HttpError(404, "Request not found", {
            code: "NOT_FOUND",
            reason: "No delete request with this id.",
          });
        }
        throw new HttpError(409, "Request is not pending", {
          code: "INVALID_STATE",
          reason: "Only pending requests can be approved or rejected.",
        });
      }

      sendSuccess(res, 200, { id, status }, "Status updated", "Delete request status was saved.");
    })
  );

  return r;
}
