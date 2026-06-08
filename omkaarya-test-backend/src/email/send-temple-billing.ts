import { sendEmail } from "./smtp.js";
import {
  buildInvoiceEmailHtml,
  buildInvoiceEmailText,
  type InvoiceEmailPayload,
} from "./invoice-email-template.js";

export type SendInvoiceOnlyEmailInput = InvoiceEmailPayload & {
  to: string;
};

/** Invoice notice with rich HTML matching the in-app InvoiceDocument layout. */
export async function sendInvoiceOnlyEmail(
  input: SendInvoiceOnlyEmailInput
): Promise<{ sent: true } | { sent: false; reason: string }> {
  if (!input.to.trim()) return { sent: false, reason: "No recipient" };
  const templeName = input.templeName.trim() || "Your temple";
  return sendEmail({
    to: input.to,
    subject: `Invoice ${input.invoiceNumber} — ${templeName}`,
    text: buildInvoiceEmailText(input),
    html: buildInvoiceEmailHtml(input),
  });
}

export async function sendPaymentReceiptEmail(input: {
  to: string;
  templeName: string;
  receiptNumber: string;
  invoiceNumber: string;
  amountCents: number;
  currency: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const amt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency || "USD",
  }).format(input.amountCents / 100);

  const text = [
    `Hi ${input.templeName.trim() || "there"},`,
    ``,
    `We have received your bank transfer. Your payment receipt is: ${input.receiptNumber} (Invoice ${input.invoiceNumber}).`,
    `Amount: ${amt}.`,
    ``,
    `Thank you,`,
    `— Omkaarya Billing`,
  ].join("\n");

  const html = `<p>We have received your bank transfer for <strong>${escapeHtml(
    input.templeName.trim() || "your temple"
  )}</strong>.</p>
    <p><strong>Receipt</strong> ${escapeHtml(input.receiptNumber)}<br/>
    <strong>Invoice</strong> ${escapeHtml(input.invoiceNumber)}<br/>
    <strong>Amount</strong> ${escapeHtml(amt)}</p>
    <p>Thank you.<br/>— Omkaarya</p>`;

  return sendEmail({
    to: input.to.trim(),
    subject: `Payment received — ${input.receiptNumber}`,
    text,
    html,
  });
}

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
