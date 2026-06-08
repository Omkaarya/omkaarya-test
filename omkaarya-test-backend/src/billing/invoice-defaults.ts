export const INVOICE_DEFAULT_DUE_DAYS = 3;

export const DEFAULT_BILLING_ISSUER = {
  name: "Omkaarya Platform",
  address: "14 Mandir Lane, London EC4A 4AB, United Kingdom",
  email: "billing@omkaarya.com",
  website: "https://omkaarya.com",
  brandLine: "Temple management for the digital age",
} as const;

export function resolveBillingIssuerFromEnv(): {
  name: string;
  address: string;
  email: string;
  website: string;
  brandLine: string;
} {
  return {
    name: process.env.BILLING_ISSUER_NAME?.trim() || DEFAULT_BILLING_ISSUER.name,
    address: process.env.BILLING_ISSUER_ADDRESS?.trim() || DEFAULT_BILLING_ISSUER.address,
    email: process.env.BILLING_ISSUER_EMAIL?.trim() || DEFAULT_BILLING_ISSUER.email,
    website: process.env.BILLING_ISSUER_WEBSITE?.trim() || DEFAULT_BILLING_ISSUER.website,
    brandLine: process.env.BILLING_BRAND_LINE?.trim() || DEFAULT_BILLING_ISSUER.brandLine,
  };
}

export function computeDefaultDueDate(issuedAt: string, amountCents: number): string | null {
  if (amountCents <= 0) return null;
  const base = new Date(issuedAt.trim() || new Date().toISOString().slice(0, 10));
  if (Number.isNaN(base.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + INVOICE_DEFAULT_DUE_DAYS);
    return fallback.toISOString().slice(0, 10);
  }
  base.setDate(base.getDate() + INVOICE_DEFAULT_DUE_DAYS);
  return base.toISOString().slice(0, 10);
}

export function formatMoneyOrZero(cents: number, currency = "USD"): string {
  const code = (currency || "USD").toUpperCase();
  const locale = code === "INR" ? "en-IN" : code === "GBP" ? "en-GB" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(
    (Number.isFinite(cents) ? cents : 0) / 100
  );
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "Temple Admin";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
