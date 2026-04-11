import { sendEmail } from "./smtp.js";

export async function sendPasswordResetOtpEmail(input: {
  to: string;
  otp: string;
  expiresInMinutes: number;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const subject = `Your password reset code`;
  const ttl = Math.max(1, Math.floor(input.expiresInMinutes));

  const text = [
    `Use this verification code to reset your password: ${input.otp}`,
    ``,
    `This code expires in ${ttl} minute${ttl === 1 ? "" : "s"}.`,
    ``,
    `If you did not request a password reset, you can ignore this email.`,
  ].join("\n");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;">
      <p>Use this verification code to reset your password:</p>
      <div style="font-size:22px;letter-spacing:4px;font-weight:700;padding:12px 14px;background:#f6f7f9;border:1px solid #e6e8ee;border-radius:10px;display:inline-block;">
        ${escapeHtml(input.otp)}
      </div>
      <p style="margin-top:14px;color:#555;">This code expires in ${ttl} minute${ttl === 1 ? "" : "s"}.</p>
      <p style="color:#555;">If you did not request a password reset, you can ignore this email.</p>
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

