import {
  computeDefaultDueDate,
  formatMoneyOrZero,
  resolveBillingIssuerFromEnv,
} from "../billing/invoice-defaults.js";

export type InvoiceEmailPayload = {
  templeName: string;
  invoiceNumber: string;
  amountCents: number;
  isTrialProforma: boolean;
  planName: string;
  billingCycle?: string;
  issuedDate?: string;
  dueDate: string | null;
  adminEmail?: string;
  adminName?: string;
  templeAddress?: string;
  description?: string;
  paymentReference?: string;
  currency?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => {
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

function formatDateLabel(d: string | null | undefined): string {
  if (!d?.trim()) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function bankFromEnv() {
  return {
    bankName: process.env.BILLING_BANK_NAME?.trim() || "Commercial Bank of Ceylon PLC",
    branchName: process.env.BILLING_BANK_BRANCH?.trim() || "Jaffna Main Branch",
    accountName: process.env.BILLING_BANK_ACCOUNT_NAME?.trim() || "Peopleux Pvt Ltd",
    accountNumber: process.env.BILLING_BANK_ACCOUNT_NUMBER?.trim() || "8010567890012",
    swift: process.env.BILLING_BANK_SWIFT?.trim() || "CCEYLKLX",
    notes:
      process.env.BILLING_PAYMENT_NOTES?.trim() ||
      "Include the payment reference in your bank transfer remarks. Transfers are verified within 2–3 business days after the slip is received.",
  };
}

export function buildInvoiceEmailHtml(input: InvoiceEmailPayload): string {
  const issuer = resolveBillingIssuerFromEnv();
  const currency = (input.currency || process.env.BILLING_CURRENCY || "USD").toUpperCase();
  const taxRateBps = Number.parseInt(process.env.BILLING_TAX_RATE_BPS || "0", 10) || 0;
  const taxLabel = process.env.BILLING_TAX_LABEL?.trim() || "Tax";
  const amountCents = input.isTrialProforma ? 0 : input.amountCents;
  const subtotal = formatMoneyOrZero(amountCents, currency);
  const taxCents = Math.max(0, Math.round((amountCents * taxRateBps) / 10_000));
  const tax = formatMoneyOrZero(taxCents, currency);
  const total = formatMoneyOrZero(amountCents + taxCents, currency);
  const issued = input.issuedDate?.trim() || new Date().toISOString().slice(0, 10);
  const due =
    input.dueDate?.trim() ||
    computeDefaultDueDate(issued, amountCents) ||
    "—";
  const bank = bankFromEnv();
  const billToLines = [
    input.adminName?.trim(),
    input.adminEmail?.trim(),
    input.templeAddress?.trim(),
  ].filter((line): line is string => Boolean(line?.trim()));
  const description =
    input.description?.trim() ||
    `${input.planName} subscription${input.billingCycle ? ` — ${input.billingCycle}` : ""}`;

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f8fafc;">
<div style="max-width:640px;margin:0 auto;padding:24px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:20px;">
      <tr>
        <td style="vertical-align:top;">
          <div style="font-size:18px;font-weight:800;color:#6366f1;">OMKAARYA</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHtml(issuer.name)}</div>
          <div style="font-size:12px;color:#64748b;white-space:pre-line;">${escapeHtml(issuer.address)}</div>
          <div style="font-size:12px;color:#64748b;">${escapeHtml(issuer.email)}</div>
          <div style="font-size:12px;color:#64748b;">${escapeHtml(issuer.website)}</div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <div style="font-size:20px;font-weight:700;">INVOICE</div>
          <div style="font-size:12px;color:#64748b;font-family:monospace;margin-top:4px;">${escapeHtml(input.invoiceNumber)}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">Issued: ${escapeHtml(formatDateLabel(issued))}</div>
          <div style="font-size:12px;color:#64748b;">Due: ${escapeHtml(formatDateLabel(due))}</div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:12px;">
          <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">From</div>
          <div style="font-size:14px;font-weight:700;">${escapeHtml(issuer.name)}</div>
          <div style="font-size:12px;color:#64748b;white-space:pre-line;">${escapeHtml(issuer.address)}<br/>${escapeHtml(issuer.email)}<br/>${escapeHtml(issuer.website)}</div>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:12px;">
          <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Bill to</div>
          <div style="font-size:14px;font-weight:700;">${escapeHtml(input.templeName.trim() || "Your temple")}</div>
          <div style="font-size:12px;color:#64748b;white-space:pre-line;">${billToLines.map(escapeHtml).join("<br/>")}</div>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <tr style="background:#f8fafc;">
        <th align="left" style="padding:10px 12px;font-size:10px;color:#64748b;text-transform:uppercase;">Description</th>
        <th align="left" style="padding:10px 12px;font-size:10px;color:#64748b;text-transform:uppercase;">Qty</th>
        <th align="right" style="padding:10px 12px;font-size:10px;color:#64748b;text-transform:uppercase;">Amount</th>
      </tr>
      <tr>
        <td style="padding:10px 12px;font-size:12px;border-top:1px solid #e5e7eb;">${escapeHtml(description)}</td>
        <td style="padding:10px 12px;font-size:12px;border-top:1px solid #e5e7eb;">1</td>
        <td align="right" style="padding:10px 12px;font-size:12px;font-weight:600;border-top:1px solid #e5e7eb;">${escapeHtml(subtotal)}</td>
      </tr>
    </table>

    <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:12px;color:#64748b;padding:4px 0;">Subtotal</td><td align="right" style="font-size:12px;padding:4px 0;">${escapeHtml(subtotal)}</td></tr>
        <tr><td style="font-size:12px;color:#64748b;padding:4px 0;">${escapeHtml(taxLabel)} (${(taxRateBps / 100).toFixed(2)}%)</td><td align="right" style="font-size:12px;padding:4px 0;">${escapeHtml(tax)}</td></tr>
        <tr><td style="font-size:14px;font-weight:700;padding-top:8px;border-top:1px solid #e5e7eb;">Total due</td><td align="right" style="font-size:14px;font-weight:700;color:#6366f1;padding-top:8px;border-top:1px solid #e5e7eb;">${escapeHtml(total)}</td></tr>
      </table>
    </div>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:700;color:#1d4ed8;margin-bottom:8px;">Bank transfer details</div>
      <div style="font-size:12px;color:#334155;line-height:1.6;">
        <strong>Bank:</strong> ${escapeHtml(bank.bankName)}<br/>
        <strong>Branch:</strong> ${escapeHtml(bank.branchName)}<br/>
        <strong>Account name:</strong> ${escapeHtml(bank.accountName)}<br/>
        <strong>Account no.:</strong> ${escapeHtml(bank.accountNumber)}<br/>
        <strong>SWIFT:</strong> ${escapeHtml(bank.swift)}
      </div>
      ${
        input.paymentReference
          ? `<div style="margin-top:10px;border:1.5px dashed #fbbf24;background:#fffbeb;border-radius:8px;padding:10px;">
              <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;">Payment reference</div>
              <div style="font-size:14px;font-weight:700;font-family:monospace;margin-top:4px;">${escapeHtml(input.paymentReference)}</div>
            </div>`
          : ""
      }
    </div>

    <p style="font-size:11px;color:#64748b;line-height:1.5;margin:0;">${escapeHtml(bank.notes)}</p>
  </div>
</div>
</body></html>`;
}

export function buildInvoiceEmailText(input: InvoiceEmailPayload): string {
  const currency = (input.currency || process.env.BILLING_CURRENCY || "USD").toUpperCase();
  const amountCents = input.isTrialProforma ? 0 : input.amountCents;
  const amount = formatMoneyOrZero(amountCents, currency);
  const issued = input.issuedDate?.trim() || new Date().toISOString().slice(0, 10);
  const due = input.dueDate?.trim() || computeDefaultDueDate(issued, amountCents) || "—";
  return [
    `Invoice ${input.invoiceNumber} for ${input.templeName.trim() || "your temple"}`,
    `Plan: ${input.planName}`,
    input.isTrialProforma ? "Amount: $0.00 (trial pro-forma)" : `Amount: ${amount}`,
    `Issued: ${issued}`,
    `Due: ${due}`,
    input.paymentReference ? `Payment reference: ${input.paymentReference}` : "",
    "",
    "— Omkaarya Billing",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Printable HTML for browser print / PDF export (same layout as invoice emails). */
export function buildInvoicePrintHtml(input: InvoiceEmailPayload): string {
  const html = buildInvoiceEmailHtml(input);
  const title = escapeHtml(input.invoiceNumber.trim() || "Invoice");
  return html
    .replace(
      "<html>",
      `<html><head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Invoice</title>
    <style>
      @media print {
        body { background: #fff !important; margin: 0 !important; }
        @page { margin: 12mm; }
      }
    </style>
    </head>`
    )
    .replace(
      "</body>",
      `<script>
      window.addEventListener("load", function () {
        if (window.matchMedia && window.matchMedia("print").matches) return;
        var params = new URLSearchParams(window.location.search);
        if (params.get("autoprint") === "1") window.print();
      });
    </script></body>`
    );
}
