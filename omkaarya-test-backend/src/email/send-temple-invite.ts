import { sendEmail } from "./smtp.js";

function getSigninUrl(): string {
  const explicit = (process.env.TEMPLE_ADMIN_SIGNIN_URL ?? "").trim();
  if (explicit) return explicit;

  const publicBase = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (publicBase) return `${publicBase}/temple-admin/signin`;

  return "http://localhost:3000/temple-admin/signin";
}

function getPublicBaseUrl(): string {
  const publicBase = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  return publicBase || "http://localhost:3000";
}

export async function sendTempleAdminInviteEmail(input: {
  to: string;
  templeName: string;
  temporaryPassword: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const url = getSigninUrl();
  const publicBase = getPublicBaseUrl();
  const name = input.templeName.trim() || "there";
  const subject = `Your Omkaarya account is ready`;

  const text = [
    `Hi ${name},`,
    ``,
    `Your Omkaarya account is ready.`,
    ``,
    `Login details:`,
    `Email: ${input.to.trim()}`,
    `Temporary password: ${input.temporaryPassword}`,
    ``,
    `For security reasons, please change your password after your first login.`,
    ``,
    `Log in: ${url}`,
    ``,
    `If you did not request this, please contact our support team immediately.`,
    ``,
    `Thanks,`,
    `The team`,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:0;background:#ffffff;">
      <div style="max-width:640px;margin:0 auto;padding:28px 22px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-weight:700;font-size:18px;letter-spacing:0.2px;">Omkaarya</div>
        </div>

        <div style="margin-top:14px;font-size:14px;color:#222;">
          <a href="${escapeAttr(publicBase)}" style="color:#111;text-decoration:none;margin-right:16px;">Home</a>
          <a href="${escapeAttr(`${publicBase}/blog`)}" style="color:#111;text-decoration:none;margin-right:16px;">Blog</a>
          <a href="${escapeAttr(`${publicBase}/tutorials`)}" style="color:#111;text-decoration:none;margin-right:16px;">Tutorials</a>
          <a href="${escapeAttr(`${publicBase}/support`)}" style="color:#111;text-decoration:none;">Support</a>
        </div>

        <div style="margin-top:26px;font-size:14px;color:#222;">
          <p style="margin:0 0 12px 0;">Hi ${escapeHtml(name)},</p>
          <p style="margin:0 0 18px 0;">Your Omkaarya account is ready.</p>

          <p style="margin:0 0 10px 0;font-weight:600;">Login details:</p>
          <p style="margin:0 0 8px 0;"><span style="color:#555;">Email:</span> ${escapeHtml(input.to.trim())}</p>
          <p style="margin:0 0 14px 0;"><span style="color:#555;">Temporary Password:</span> ${escapeHtml(input.temporaryPassword)}</p>

          <p style="margin:0 0 16px 0;color:#555;">
            For security reasons, please change your password after your first login.
          </p>

          <p style="margin:0 0 16px 0;color:#555;">
            If you did not request this, please contact our support team immediately.
          </p>

          <p style="margin:0 0 16px 0;color:#555;">Thanks,<br/>The team</p>

          <div style="margin-top:18px;">
            <a href="${escapeAttr(url)}" style="display:inline-block;padding:10px 18px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
              Log in
            </a>
          </div>
        </div>

        <div style="margin-top:28px;font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Omkaarya
        </div>
      </div>
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
