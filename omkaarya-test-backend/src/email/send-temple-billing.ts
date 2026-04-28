import { sendEmail } from "./smtp.js";

function getPublicBaseUrl(): string {
  return (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "") || "http://localhost:3000";
}

function usd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

/** For existing user with password: invoice notice only. */
export async function sendInvoiceOnlyEmail(input: {
  to: string;
  templeName: string;
  invoiceNumber: string;
  amountCents: number;
  isTrialProforma: boolean;
  planName: string;
  dueDate: string | null;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  if (!input.to.trim()) return { sent: false, reason: "No recipient" };
  return sendEmail({
    to: input.to,
    subject: `Invoice ${input.invoiceNumber} — ${input.templeName.trim() || "Your temple"}`,
    text: [
      `Your subscription invoice is ready for ${input.templeName.trim() || "your temple"}.`,
      ``,
      `Invoice: ${input.invoiceNumber}`,
      `Plan: ${input.planName}`,
      input.isTrialProforma
        ? "Amount: $0.00 (trial pro-forma)"
        : `Amount: ${usd(input.amountCents)}`,
      input.dueDate ? `Due: ${input.dueDate}` : "",
      ``,
      `— Omkaarya Billing`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<p>Your subscription invoice is ready.</p>
      <p><strong>Invoice</strong> ${escapeHtml(
        input.invoiceNumber
      )} · <strong>Plan</strong> ${escapeHtml(input.planName)}<br/>
      ${
        input.isTrialProforma
          ? "<em>Trial pro-forma — $0.00</em>"
          : escapeHtml(usd(input.amountCents))
      }<br/>
      ${input.dueDate ? `Due: ${escapeHtml(input.dueDate)}` : ""}
      </p>
      <p>— Omkaarya</p>`,
  });
}

/**
 * For new admins: one email with sign-in and invoice.
 */
export async function sendTempleInviteAndInvoiceCombined(input: {
  to: string;
  templeName: string;
  temporaryPassword: string;
  invoiceNumber: string;
  amountCents: number;
  isTrialProforma: boolean;
  planName: string;
  dueDate: string | null;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const url = (() => {
    const explicit = (process.env.TEMPLE_ADMIN_SIGNIN_URL ?? "").trim();
    if (explicit) return explicit;
    const b = getPublicBaseUrl();
    return b ? `${b}/temple-admin/signin` : "http://localhost:3000/temple-admin/signin";
  })();

  const name = input.templeName.trim() || "there";
  const subject = `Your Omkaarya account and invoice — ${input.invoiceNumber}`;

  const invBlock = input.isTrialProforma
    ? `Trial pro-forma invoice: ${input.invoiceNumber} ($0.00) — plan ${input.planName}.`
    : `Invoice ${input.invoiceNumber}: ${usd(input.amountCents)} for plan ${input.planName}.` +
      (input.dueDate ? ` Due ${input.dueDate}.` : "");

  const text = [
    `Hi ${name},`,
    ``,
    `Your Omkaarya account is ready.`,
    `Email: ${input.to.trim()}`,
    `Temporary password: ${input.temporaryPassword}`,
    ``,
    `Billing: ${invBlock}`,
    `Pay by bank using the instructions you will see in the product after sign-in, or as agreed with our team.`,
    ``,
    `Log in: ${url}`,
    ``,
    `For security, change your password after your first login.`,
    ``,
    `— The team`,
  ].join("\n");

  const html = `
  <div style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:28px 22px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;">
      <p style="margin:0 0 12px 0;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 12px 0;">Your Omkaarya account is ready.</p>
      <p style="margin:0 0 8px 0;"><span style="color:#555">Email</span> ${escapeHtml(input.to.trim())}</p>
      <p style="margin:0 0 18px 0;"><span style="color:#555">Temporary password</span> <strong>${escapeHtml(
        input.temporaryPassword
      )}</strong></p>
      <div style="border:1px solid #eee;border-radius:8px;padding:14px;margin:0 0 18px 0;background:#fafafa;">
        <p style="margin:0 0 6px 0;font-weight:600">Invoice</p>
        <p style="margin:0;">
          ${input.isTrialProforma
            ? `${escapeHtml(input.invoiceNumber)} — <em>Trial pro-forma ($0.00)</em> — ${escapeHtml(
                input.planName
              )}`
            : `${escapeHtml(input.invoiceNumber)} — <strong>${escapeHtml(
                usd(input.amountCents)
              )}</strong> — ${escapeHtml(input.planName)}${
                input.dueDate ? ` · Due ${escapeHtml(input.dueDate)}` : ""
              }`}
        </p>
      </div>
      <a href="${escapeAttr(url)}" style="display:inline-block;padding:10px 18px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Log in</a>
    </div>
  </div>`.trim();

  return sendEmail({ to: input.to, subject, text, html });
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

function escapeAttr(value: string): string {
  return escapeHtml(value);
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
