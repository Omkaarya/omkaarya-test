import nodemailer from "nodemailer";

type SmtpConfig =
  | { enabled: false; reason: string }
  | {
      enabled: true;
      from: string;
      transport: nodemailer.Transporter;
    };

function getEnvTrimmed(key: string): string {
  return (process.env[key] ?? "").trim();
}

export function getSmtpConfig(): SmtpConfig {
  const from = getEnvTrimmed("EMAIL_FROM");
  if (!from) {
    return { enabled: false, reason: "EMAIL_FROM is not set" };
  }

  const smtpUrl = getEnvTrimmed("SMTP_URL");
  if (smtpUrl) {
    const transport = nodemailer.createTransport(smtpUrl);
    return { enabled: true, from, transport };
  }

  const host = getEnvTrimmed("SMTP_HOST");
  const rawPort = getEnvTrimmed("SMTP_PORT");
  const user = getEnvTrimmed("SMTP_USER");
  const pass = getEnvTrimmed("SMTP_PASS");
  if (!host || !rawPort) {
    return { enabled: false, reason: "SMTP_URL or SMTP_HOST/SMTP_PORT is not set" };
  }

  const port = Number(rawPort);
  if (!Number.isFinite(port) || port <= 0) {
    return { enabled: false, reason: "SMTP_PORT is invalid" };
  }

  const secureRaw = getEnvTrimmed("SMTP_SECURE").toLowerCase();
  const secure = secureRaw === "1" || secureRaw === "true";

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  return { enabled: true, from, transport };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ sent: true } | { sent: false; reason: string }> {
  const cfg = getSmtpConfig();
  if (!cfg.enabled) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email] disabled: ${cfg.reason}`);
    }
    return { sent: false, reason: cfg.reason };
  }

  await cfg.transport.sendMail({
    from: cfg.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  });

  return { sent: true };
}
