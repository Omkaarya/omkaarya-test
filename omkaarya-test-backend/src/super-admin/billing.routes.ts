import { Router } from "express";
import { sendSuccess, sendError } from "../middleware/api-envelope.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { sendInvoiceOnlyEmail, sendPaymentReceiptEmail } from "../email/send-temple-billing.js";
import { PostgresBillingRepository, confirmPaymentSubmission, listPendingPaymentSubmissionsForConfirm, rejectPaymentSubmission } from "./billing.repository.js";

function asString(v: unknown): string {
  return typeof v === "string" ? v : Array.isArray(v) ? String(v[0] ?? "") : "";
}

function parsePeriod(raw: string): Parameters<PostgresBillingRepository["revenueDashboard"]>[0]["period"] {
  const s = (raw || "").trim();
  if (s === "this-month" || s === "last-month" || s === "this-year") return s;
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  if (m) return s as Parameters<PostgresBillingRepository["revenueDashboard"]>[0]["period"];
  return "this-month";
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
    "/billing/profile",
    asyncHandler(async (_req, res) => {
      const profile = {
        issuer: {
          name: process.env.BILLING_ISSUER_NAME || "",
          address: process.env.BILLING_ISSUER_ADDRESS || "",
          email: process.env.BILLING_ISSUER_EMAIL || "",
          website: process.env.BILLING_ISSUER_WEBSITE || "",
          brandLine: process.env.BILLING_BRAND_LINE || "",
        },
        paymentMethodLabel: process.env.BILLING_PAYMENT_METHOD_LABEL || "Bank transfer",
        bank: {
          bankName: process.env.BILLING_BANK_NAME || "",
          accountName: process.env.BILLING_BANK_ACCOUNT_NAME || "",
          accountNumber: process.env.BILLING_BANK_ACCOUNT_NUMBER || "",
          swift: process.env.BILLING_BANK_SWIFT || "",
          notes:
            process.env.BILLING_PAYMENT_NOTES || "",
        },
        tax: {
          rateBps: Number.parseInt(process.env.BILLING_TAX_RATE_BPS || "0", 10) || 0,
          label: process.env.BILLING_TAX_LABEL || "Tax",
        },
        money: {
          currency: (process.env.BILLING_CURRENCY || "USD").toUpperCase(),
        },
      };

      sendSuccess(res, 200, profile, "Billing profile", "Issuer + bank + tax settings for finance screens.");
    })
  );

  r.get(
    "/billing/invoices/export",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const status = parseListStatus(asString(req.query.status));
      const payload = await billing.listInvoices({ q, status, page: 1, pageSize: 10_000 });
      const header = [
        "invoiceNumber",
        "temple",
        "templeLocation",
        "adminEmail",
        "plan",
        "period",
        "amountCents",
        "currency",
        "issuedDate",
        "dueDate",
        "status",
      ];
      const lines = [header.join(",")].concat(
        payload.data.map((r) =>
          [
            r.num,
            r.temple,
            r.templeLocation,
            r.adminEmail,
            r.plan,
            r.period,
            String(r.amountCents),
            r.currency,
            r.issuedDate,
            r.dueDate ?? "",
            r.status,
          ]
            .map(csvCell)
            .join(",")
        )
      );
      res
        .status(200)
        .type("text/csv; charset=utf-8")
        .setHeader("Content-Disposition", `attachment; filename="invoices.csv"`)
        .send(lines.join("\n"));
    })
  );

  r.get(
    "/billing/transactions/export",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const st = (asString(req.query.status) || "all") as "all" | "paid" | "pending" | "overdue";
      const plan = asString(req.query.plan) || "all";
      const period = parsePeriod(asString(req.query.period));
      const payload = await billing.listTransactions({ q, status: st, plan, period, page: 1, pageSize: 10_000 });
      const header = [
        "id",
        "date",
        "temple",
        "templeLocation",
        "invoiceId",
        "invoiceRef",
        "plan",
        "amountCents",
        "currency",
        "method",
        "status",
      ];
      const lines = [header.join(",")].concat(
        payload.data.map((r) =>
          [
            r.id,
            r.date,
            r.temple,
            r.templeLocation,
            r.invoiceId,
            r.invoiceRef,
            r.plan,
            String(r.amountCents),
            r.currency,
            r.method,
            r.status,
          ]
            .map(csvCell)
            .join(",")
        )
      );
      res
        .status(200)
        .type("text/csv; charset=utf-8")
        .setHeader("Content-Disposition", `attachment; filename="transactions.csv"`)
        .send(lines.join("\n"));
    })
  );

  r.get(
    "/billing/receipts/export",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const period = parsePeriod(asString(req.query.period));
      const payload = await billing.listReceipts({ q, period, page: 1, pageSize: 10_000 });
      const header = ["receiptNumber", "temple", "templeLocation", "invoiceRef", "plan", "amountCents", "paymentDate", "method"];
      const lines = [header.join(",")].concat(
        payload.data.map((r) =>
          [
            r.num,
            r.temple,
            r.templeLocation,
            r.invoiceRef,
            r.plan,
            String(r.amountCents),
            r.paymentDate,
            r.method,
          ]
            .map(csvCell)
            .join(",")
        )
      );
      res
        .status(200)
        .type("text/csv; charset=utf-8")
        .setHeader("Content-Disposition", `attachment; filename="receipts.csv"`)
        .send(lines.join("\n"));
    })
  );

  r.get(
    "/billing/revenue-dashboard",
    asyncHandler(async (req, res) => {
      const period = parsePeriod(asString(req.query.period));
      const payload = await billing.revenueDashboard({ period });
      sendSuccess(res, 200, payload, "Revenue dashboard", "Hybrid finance overview for the selected period.");
    })
  );

  r.get(
    "/billing/transactions/kpis",
    asyncHandler(async (req, res) => {
      const period = parsePeriod(asString(req.query.period));
      const payload = await billing.transactionsKpis({ period });
      sendSuccess(res, 200, payload, "Transaction KPIs", "Finance KPI cards for transactions page.");
    })
  );

  r.get(
    "/billing/receipts/kpis",
    asyncHandler(async (req, res) => {
      const period = parsePeriod(asString(req.query.period));
      const payload = await billing.receiptsKpis({ period });
      sendSuccess(res, 200, payload, "Receipt KPIs", "Finance KPI cards for receipts page.");
    })
  );

  r.get(
    "/billing/temples/options",
    asyncHandler(async (_req, res) => {
      const data = await billing.listTempleOptions();
      sendSuccess(res, 200, { data }, "Temple options", "Temples for invoice generation dropdown.");
    })
  );

  r.post(
    "/billing/invoices/generate",
    asyncHandler(async (req, res) => {
      const body = (req.body ?? {}) as Partial<{
        tenantId: string;
        planName: string;
        billingCycleRaw: string;
        issueDate: string;
        dueDate: string;
        description: string;
        sendEmail: boolean;
      }>;
      const out = await billing.generateInvoice({
        tenantId: String(body.tenantId ?? ""),
        planName: String(body.planName ?? ""),
        billingCycleRaw: String(body.billingCycleRaw ?? ""),
        issueDate: String(body.issueDate ?? ""),
        dueDate: String(body.dueDate ?? ""),
        description: String(body.description ?? ""),
        sendEmail: body.sendEmail !== false,
      });

      let emailed = false;
      if (body.sendEmail !== false) {
        try {
          const ctx = await billing.getInvoiceEmailContext(out.invoiceId);
          if (ctx) {
            const em = await sendInvoiceOnlyEmail(ctx);
            emailed = em.sent;
          }
        } catch (e) {
          console.error("[billing-generate] invoice email failed", e);
        }
      }

      sendSuccess(
        res,
        200,
        { ...out, emailed },
        "Invoice generated",
        "Invoice row created and optionally emailed to the temple admin."
      );
    })
  );

  r.post(
    "/billing/invoices/:id/email",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const ctx = await billing.getInvoiceEmailContext(id);
      if (!ctx) {
        sendError(res, 404, "NOT_FOUND", "Invoice not found.", "No invoice exists for the given id.");
        return;
      }
      const em = await sendInvoiceOnlyEmail(ctx);
      sendSuccess(res, 200, { emailed: em.sent, reason: em.sent ? "sent" : em.reason }, "Invoice email", "Invoice email attempt completed.");
    })
  );

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
    "/billing/invoices/:id/receipt",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const row = await billing.getReceiptForInvoice(id);
      if (!row) {
        sendError(res, 404, "NOT_FOUND", "Receipt not found.", "No receipt exists for the given invoice id.");
        return;
      }
      sendSuccess(res, 200, row, "Invoice receipt", "Receipt associated with this invoice.");
    })
  );

  r.get(
    "/billing/transactions",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const st = (asString(req.query.status) || "all") as "all" | "paid" | "pending" | "overdue";
      const plan = asString(req.query.plan) || "all";
      const period = parsePeriod(asString(req.query.period));
      const page = Number.parseInt(asString(req.query.page) || "1", 10);
      const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
      const payload = await billing.listTransactions({ q, status: st, plan, period, page, pageSize });
      sendSuccess(res, 200, payload, "Transactions", "Paginated billing transactions.");
    })
  );

  r.get(
    "/billing/receipts",
    asyncHandler(async (req, res) => {
      const q = asString(req.query.q);
      const period = parsePeriod(asString(req.query.period));
      const page = Number.parseInt(asString(req.query.page) || "1", 10);
      const pageSize = Number.parseInt(asString(req.query.pageSize) || "10", 10);
      const payload = await billing.listReceipts({ q, period, page, pageSize });
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

  r.post(
    "/billing/receipts/:id/email",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const row = await billing.getReceiptDetail(id);
      if (!row) {
        sendError(res, 404, "NOT_FOUND", "Receipt not found.", "No row for the given id.");
        return;
      }
      const em = await sendPaymentReceiptEmail({
        to: row.email,
        templeName: row.temple,
        receiptNumber: row.num,
        invoiceNumber: row.invoiceRef,
        amountCents: row.amountCents,
        currency: row.currency,
      });
      sendSuccess(
        res,
        200,
        { emailed: em.sent, reason: em.sent ? "sent" : em.reason },
        "Receipt email",
        "Receipt email attempt completed."
      );
    })
  );

  r.get(
    "/billing/receipts/:id/print",
    asyncHandler(async (req, res) => {
      const id = asString((req.params as { id?: string }).id);
      const row = await billing.getReceiptDetail(id);
      if (!row) {
        res.status(404).type("text/plain").send("Receipt not found");
        return;
      }
      const amount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.currency || "USD",
      }).format(row.amountCents / 100);
      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(row.num)} — Receipt</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 32px; color: #111; }
      .muted { color: #555; }
      .box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; }
      .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
      .row:last-child { border-bottom: 0; }
      h1 { margin: 0 0 6px 0; font-size: 20px; }
      h2 { margin: 0; font-size: 14px; }
      .amt { font-size: 24px; font-weight: 800; margin: 0; }
      @media print { body { margin: 0; } }
    </style>
  </head>
  <body>
    <div class="box">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;">
        <div>
          <h1>Payment receipt</h1>
          <div class="muted">${escapeHtml(row.num)} · Linked to ${escapeHtml(row.invoiceRef)}</div>
          <div class="muted">${escapeHtml(row.templeLine)}</div>
        </div>
        <div style="text-align:right">
          <div class="muted">Amount received</div>
          <p class="amt">${escapeHtml(amount)}</p>
        </div>
      </div>

      <h2>Details</h2>
      <div class="row"><div class="muted">Temple</div><div>${escapeHtml(row.templeLine)}</div></div>
      <div class="row"><div class="muted">Portal</div><div>${escapeHtml(row.portal)}</div></div>
      <div class="row"><div class="muted">Admin email</div><div>${escapeHtml(row.email)}</div></div>
      <div class="row"><div class="muted">Plan</div><div>${escapeHtml(row.plan)}</div></div>
      <div class="row"><div class="muted">Payment ref</div><div>${escapeHtml(row.paymentRef)}</div></div>
      <div class="row"><div class="muted">Method</div><div>${escapeHtml(row.method)}</div></div>
      <div class="row"><div class="muted">Payment date</div><div>${escapeHtml(row.paymentDate)}</div></div>
      <div class="row"><div class="muted">Period</div><div>${escapeHtml(row.periodFrom)} – ${escapeHtml(row.periodTo)}</div></div>
      <div class="row"><div class="muted">Next renewal</div><div>${escapeHtml(row.nextRenewal)}</div></div>

      <p class="muted" style="margin-top:18px;font-size:12px;">
        Generated by Omkaarya on ${escapeHtml(row.generatedAt)}. Receipt number: ${escapeHtml(row.num)}.
      </p>
    </div>
  </body>
</html>`;
      res.status(200).type("text/html; charset=utf-8").send(html);
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
      const verifiedBy =
        typeof body.verifiedBy === "string"
          ? body.verifiedBy
          : process.env.SUPER_ADMIN_VERIFIER_NAME || "System";
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

function escapeHtml(value: string): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
