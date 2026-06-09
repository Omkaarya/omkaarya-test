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

function getForgotPasswordUrl(): string {
  const publicBase = getPublicBaseUrl();
  return `${publicBase}/temple-admin/forgot-password`;
}

export async function sendTempleAdminInviteEmail(input: {
  to: string;
  templeName: string;
  temporaryPassword?: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const to = input.to.trim();
  if (!to) return { sent: false, reason: "No recipient" };

  const baseSigninUrl = getSigninUrl();
  const url = `${baseSigninUrl}?email=${encodeURIComponent(to)}&templeName=${encodeURIComponent(input.templeName)}`;
  const forgotUrl = getForgotPasswordUrl();
  const publicBase = getPublicBaseUrl();
  const name = input.templeName.trim() || "there";
  const tempPassword = input.temporaryPassword?.trim() ?? "";
  const hasTempPassword = tempPassword.length > 0;
  const subject = hasTempPassword
    ? `Your Omkaarya temple admin login — ${name}`
    : `Your Omkaarya temple admin access — ${name}`;

  const text = hasTempPassword
    ? [
        `Hi ${name},`,
        ``,
        `Your Omkaarya temple admin account is ready.`,
        ``,
        `Login details:`,
        `Email: ${to}`,
        `Temporary password: ${tempPassword}`,
        ``,
        `For security reasons, please change your password after your first login.`,
        ``,
        `Log in: ${url}`,
        ``,
        `If you did not request this, please contact our support team immediately.`,
        ``,
        `Thanks,`,
        `The team`,
      ].join("\n")
    : [
        `Hi ${name},`,
        ``,
        `Your Omkaarya temple admin access is ready.`,
        ``,
        `Sign in with your existing Omkaarya password:`,
        `Email: ${to}`,
        `Log in: ${url}`,
        ``,
        `If you forgot your password: ${forgotUrl}`,
        ``,
        `Thanks,`,
        `The team`,
      ].join("\n");

  const credentialsHtml = hasTempPassword
    ? `<p style="margin:0 0 10px 0;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Login details:</p>
          <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><span style="color:#555;">Email:</span> ${escapeHtml(to)}</p>
          <p style="margin:0 0 14px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><span style="color:#555;">Temporary Password:</span> ${escapeHtml(tempPassword)}</p>
          <p style="margin:0 0 16px 0;color:#555;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            For security reasons, please change your password after your first login.
          </p>`
    : `<p style="margin:0 0 10px 0;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Sign in with your existing Omkaarya password</p>
          <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><span style="color:#555;">Email:</span> ${escapeHtml(to)}</p>
          <p style="margin:0 0 14px 0;color:#555;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <a href="${escapeAttr(forgotUrl)}" style="color:#f97316;">Reset your password</a> if you need a new one.
          </p>`;

  const html = `
    <div style="margin:0;padding:0;background:#ffffff;">
      <div style="max-width:640px;margin:0 auto;padding:28px 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;">
        <div style="margin-bottom:20px;">
          <img src="${escapeAttr(publicBase)}/pepulux-logo.png" alt="Pepulux" style="display:block;height:32px;width:auto;" />
        </div>

        <div style="margin-top:14px;font-size:14px;color:#222;font-weight:500;">
          <a href="${escapeAttr(publicBase)}" style="color:#111;text-decoration:none;margin-right:24px;">Home</a>
          <a href="${escapeAttr(`${publicBase}/blog`)}" style="color:#111;text-decoration:none;margin-right:24px;">Blog</a>
          <a href="${escapeAttr(`${publicBase}/tutorials`)}" style="color:#111;text-decoration:none;margin-right:24px;">Tutorials</a>
          <a href="${escapeAttr(`${publicBase}/support`)}" style="color:#111;text-decoration:none;">Support</a>
        </div>

        <div style="margin-top:26px;font-size:14px;color:#222;line-height:1.6;">
          <p style="margin:0 0 16px 0;">Hi ${escapeHtml(name)},</p>
          <p style="margin:0 0 16px 0;">Your Omkaarya account is ready 🔐</p>

          ${credentialsHtml}

          <p style="margin:0 0 16px 0;color:#555;">
            If you did not request this, please contact our support team immediately.
          </p>

          <p style="margin:0 0 4px 0;">Thanks,</p>
          <p style="margin:0 0 24px 0;">The team</p>

          <div style="margin-top:24px;margin-bottom:28px;">
            <a href="${escapeAttr(url)}" style="display:inline-block;padding:12px 24px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
              Log in to Portal
            </a>
          </div>
        </div>

        <div style="margin-top:32px;border-top:1px solid #eee;padding-top:20px;font-size:12px;color:#666;line-height:1.5;">
          <p style="margin:0 0 12px 0;">
            This email was sent to <a href="mailto:${escapeAttr(to)}" style="color:#f97316;text-decoration:none;">${escapeHtml(to)}</a>. If you&apos;d rather not receive this kind of email, you can <a href="#" style="color:#f97316;text-decoration:underline;">unsubscribe</a> or <a href="#" style="color:#f97316;text-decoration:underline;">manage your email preferences</a>.
          </p>
          <p style="margin:0 0 24px 0;">
            © 2026 Pepulux Pvt Ltd, 100 Smith Street, Melbourne VIC 3000
          </p>
          
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <img src="${escapeAttr(publicBase)}/pepulux-logo.png" alt="Pepulux" style="display:block;height:24px;width:auto;" />
            </div>
            <div style="display:flex;align-items:center;gap:16px;">
              <a href="#" style="color:#555;text-decoration:none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" style="color:#555;text-decoration:none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#" style="color:#555;text-decoration:none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `.trim();

  return sendEmail({ to, subject, text, html });
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
