import { Router } from "express";
import { sendSuccess, sendError } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { sendPaymentReceiptEmail } from "../email/send-temple-billing.js";
import { PostgresBillingRepository, confirmPaymentSubmission, listPendingPaymentSubmissionsForConfirm, rejectPaymentSubmission } from "./billing.repository.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "";
}

function parseListStatus(
  raw: string
):
  | "all"
  | "paid"
  | "pending"
  | "overdue"
  | "awaiting"
  | "draft"
  | "proforma"
  | "void"
  | "rejected" {
  const s = raw.trim();
  if (
    s === "paid" ||
    s === "pending" ||
    s === "overdue" ||
    s === "all" ||
    s === "awaiting" ||
    s === "draft" ||
    s === "proforma" ||
    s === "void" ||
    s === "rejected"
  ) {
    return s;
  }
  return "all";
}

export function createBillingRouter(billing: PostgresBillingRepository): Router {
  const r = Router();

  r.get(
    "/billing/invoices",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const status = parseListStatus(asString(req.query.status));
      const page = Number.parseInt(asString(req.query.page) || "1", 10);
      const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
      const payload = await billing.listInvoices({ q, status, page, pageSize });
      sendSuccess(res, 200, payload, "Invoices", "Paginated temple invoices for super-admin.");
    })
  );

  r.get(
    "/billing/invoices/:id",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const row = await billing.getInvoiceById(id);
      if (!row) {
        sendError(res, 404, "NOT_FOUND", "Invoice not found.", "No row for the given id.");
        return;
      }
      sendSuccess(res, 200, row, "Invoice", "Single invoice row.");
    })
  );

  r.get(
    "/billing/transactions",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const st = (asString(req.query.status) || "all") as "all" | "paid" | "pending" | "overdue";
      const plan = asString(req.query.plan) || "all";
      const page = Number.parseInt(asString(req.query.page) || "1", 10);
      const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
      const payload = await billing.listTransactions({ q, status: st, plan, page, pageSize });
      sendSuccess(res, 200, payload, "Transactions", "Paginated billing transactions.");
    })
  );

  r.get(
    "/billing/receipts",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const page = Number.parseInt(asString(req.query.page) || "1", 10);
      const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
      const payload = await billing.listReceipts({ q, page, pageSize });
      sendSuccess(res, 200, payload, "Receipts", "Paginated receipts.");
    })
  );

  r.get(
    "/billing/receipts/:id",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const row = await billing.getReceiptDetail(id);
      if (!row) {
        sendError(res, 404, "NOT_FOUND", "Receipt not found.", "No row for the given id.");
        return;
      }
      sendSuccess(res, 200, row, "Receipt", "Receipt details.");
    })
  );

  r.get(
    "/billing/payment-submissions/pending",
    asyncHandler(async (_req, res) => {
      const data = await listPendingPaymentSubmissionsForConfirm();
      sendSuccess(
        res,
        200,
        { data },
        "Pending payment submissions",
        "Temple bank transfers waiting for super-admin review."
      );
    })
  );

  r.post(
    "/billing/payment-submissions/:id/confirm",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const body = (req.body ?? {}) as { verifiedBy?: string };
      const verifiedBy = typeof body.verifiedBy === "string" ? body.verifiedBy : "Super Admin";
      const out = await confirmPaymentSubmission(id, verifiedBy);
      if (!out.ok) {
        const code = out.reason === "not_found" || out.reason === "not_linked" ? 404 : 409;
        sendError(
          res,
          code,
          out.reason === "not_found" ? "NOT_FOUND" : "INVALID_STATE",
          "Could not confirm this payment.",
          out.reason
        );
        return;
      }
      let emailed = false;
      try {
        const em = await sendPaymentReceiptEmail({
          to: out.adminEmail,
          templeName: out.templeName,
          receiptNumber: out.receiptNumber,
          invoiceNumber: out.invoiceNumber,
          amountCents: out.amountCents,
          currency: out.currency,
        });
        emailed = em.sent;
      } catch (e) {
        console.error("[billing-confirm] receipt email failed", e);
      }
      sendSuccess(
        res,
        200,
        { receiptNumber: out.receiptNumber, emailed },
        "Payment confirmed",
        "Submission approved, receipt issued, and subscription activated where applicable."
      );
    })
  );

  r.post(
    "/billing/payment-submissions/:id/reject",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const out = await rejectPaymentSubmission(id);
      if (!out.ok) {
        sendError(res, 404, "NOT_FOUND", "Could not reject.", "Submission missing or not pending.");
        return;
      }
      sendSuccess(res, 200, { rejected: true }, "Payment submission rejected", "The submission was marked rejected.");
    })
  );

  return r;
}
