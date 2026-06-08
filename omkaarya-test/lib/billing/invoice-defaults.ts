import { flatPlatformBankDetails } from "@/lib/omkaarya-platform-bank-details";
import { formatMoneyFromCents } from "@/lib/temple-pricing-plans";
import type { BillingBankDetails, BillingIssuer, BillingProfile, InvoiceBillToBlock } from "./invoice-types";

export const INVOICE_DEFAULT_DUE_DAYS = 3;

export const DEFAULT_BILLING_ISSUER: BillingIssuer = {
  name: "Omkaarya Platform",
  address: "14 Mandir Lane, London EC4A 4AB, United Kingdom",
  email: "billing@omkaarya.com",
  website: "https://omkaarya.com",
  brandLine: "Temple management for the digital age",
};

export function resolveBillingIssuer(partial?: Partial<BillingIssuer>): BillingIssuer {
  return {
    name: partial?.name?.trim() || DEFAULT_BILLING_ISSUER.name,
    address: partial?.address?.trim() || DEFAULT_BILLING_ISSUER.address,
    email: partial?.email?.trim() || DEFAULT_BILLING_ISSUER.email,
    website: partial?.website?.trim() || DEFAULT_BILLING_ISSUER.website,
    brandLine: partial?.brandLine?.trim() || DEFAULT_BILLING_ISSUER.brandLine,
  };
}

export function resolveBillingProfile(profile: BillingProfile | null | undefined): BillingProfile {
  const platformBank = flatPlatformBankDetails();
  const issuer = resolveBillingIssuer(profile?.issuer);
  const bankFromProfile = profile?.bank;
  const bankHasData = Boolean(
    bankFromProfile?.bankName?.trim() ||
      bankFromProfile?.accountName?.trim() ||
      bankFromProfile?.accountNumber?.trim()
  );
  return {
    issuer,
    paymentMethodLabel: profile?.paymentMethodLabel?.trim() || "Bank transfer",
    bank: bankHasData
      ? {
          bankName: bankFromProfile!.bankName?.trim() || platformBank.bankName,
          accountName: bankFromProfile!.accountName?.trim() || platformBank.accountName,
          accountNumber: bankFromProfile!.accountNumber?.trim() || platformBank.accountNumber,
          swift: bankFromProfile!.swift?.trim() || platformBank.swift,
          notes: bankFromProfile!.notes?.trim() || platformBank.notes,
        }
      : {
          bankName: platformBank.bankName,
          accountName: platformBank.accountName,
          accountNumber: platformBank.accountNumber,
          swift: platformBank.swift,
          notes: platformBank.notes,
        },
    tax: {
      rateBps: profile?.tax?.rateBps ?? 0,
      label: profile?.tax?.label?.trim() || "Tax",
    },
    money: {
      currency: (profile?.money?.currency || "USD").toUpperCase(),
    },
  };
}

export function resolveBillingBankDetails(profile: BillingProfile | null | undefined): BillingBankDetails {
  const resolved = resolveBillingProfile(profile);
  const platform = flatPlatformBankDetails();
  return {
    header: "Peopleux Pvt Ltd — Receiving Account",
    bankName: resolved.bank.bankName,
    branchName: platform.branchName,
    accountName: resolved.bank.accountName,
    accountNumber: resolved.bank.accountNumber,
    swift: resolved.bank.swift,
    notes: resolved.bank.notes,
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

export function formatMoneyOrZero(cents: number | null | undefined, currency = "USD"): string {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  return formatMoneyFromCents(value, currency);
}

export function formatInvoiceDate(d: string | null | undefined): string {
  if (!d || d.trim() === "" || d === "—") return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function billToPreviewLines(billTo: InvoiceBillToBlock | null | undefined): string {
  if (!billTo) return "—";
  const lines = [
    billTo.adminName,
    billTo.adminEmail,
    billTo.portalUrl,
    billTo.addressLine,
  ].filter((line) => (line ?? "").trim().length > 0) as string[];
  return lines.length > 0 ? lines.join("\n") : "—";
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

export function resolveAdminDisplayName(input: {
  fullName?: string | null;
  role?: string | null;
  email?: string | null;
}): string {
  const name = input.fullName?.trim();
  if (name) return name;
  const role = input.role?.trim();
  if (role && role.toLowerCase() !== "temple admin") return role;
  const email = input.email?.trim();
  if (email) return displayNameFromEmail(email);
  return "Temple Admin";
}
