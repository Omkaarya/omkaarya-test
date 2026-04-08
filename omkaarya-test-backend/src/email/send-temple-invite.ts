import { sendEmail } from "./smtp.js";

function getSigninUrl(): string {
  const explicit = (process.env.TEMPLE_ADMIN_SIGNIN_URL ?? "").trim();
  if (explicit) return explicit;

  const publicBase = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (publicBase) return `${publicBase}/temple-admin/signin`;

  return "http://localhost:3000/temple-admin/signin";
}

export async function sendTempleAdminInviteEmail(input: {
  to: string;
  templeName: string;
  temporaryPassword: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const url = getSigninUrl();
  const name = input.templeName.trim() || "your temple";
  const subject = `Your Omkaarya temple admin access`;

  const text = [
    `Hello,`,
    ``,
    `Your temple (${name}) has been registered on Omkaarya.`,
    `Use the temporary password below to sign in and set your new password:`,
    ``,
    `Email: ${input.to.trim()}`,
    `Temporary password: ${input.temporaryPassword}`,
    ``,
    `Sign in: ${url}`,
    ``,
    `If you did not expect this email, you can ignore it.`,
  ].join("\n");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;">
      <p>Hello,</p>
      <p>Your temple (<strong>${escapeHtml(name)}</strong>) has been registered on Omkaarya.</p>
      <p>Use the temporary password below to sign in and set your new password:</p>
      <div style="padding:12px 14px;background:#f6f7f9;border:1px solid #e6e8ee;border-radius:8px;display:inline-block;">
        <div><strong>Email:</strong> ${escapeHtml(input.to.trim())}</div>
        <div><strong>Temporary password:</strong> <code>${escapeHtml(input.temporaryPassword)}</code></div>
      </div>
      <p style="margin-top:16px;">
        <a href="${escapeAttr(url)}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Sign in
        </a>
      </p>
      <p style="color:#555;">If you did not expect this email, you can ignore it.</p>
    </div>
  `.trim();

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
