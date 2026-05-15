import type { SuperAdminTempleDetail } from "@/lib/super-admin-temple-detail";

export type InvoiceBillTo = {
  templeName: string;
  adminName: string;
  adminEmail: string;
  portalUrl: string;
  addressLine: string;
};

export function normalizeInvoiceBillingCycle(raw: string | null | undefined): "Monthly" | "Annually" {
  const s = (raw ?? "").trim().toLowerCase();
  if (s.includes("annual") || s.includes("year") || s === "yr") return "Annually";
  return "Monthly";
}

export function buildInvoiceDescription(
  planName: string,
  billingCycleRaw: "Monthly" | "Annually",
  templeName?: string
): string {
  const cycle = billingCycleRaw === "Annually" ? "Annual" : "Monthly";
  const templeLabel = templeName?.trim();
  return templeLabel
    ? `${planName} subscription — ${cycle} (${templeLabel})`
    : `${planName} subscription — ${cycle}`;
}

export function buildGenerateInvoiceHref(params: {
  tenantId?: string;
  plan?: string;
  billingCycle?: string;
}): string {
  const q = new URLSearchParams();
  if (params.tenantId) q.set("tenantId", params.tenantId);
  if (params.plan) q.set("plan", params.plan);
  if (params.billingCycle) q.set("billingCycle", params.billingCycle);
  const s = q.toString();
  return `/super-admin/finance/invoices/generate${s ? `?${s}` : ""}`;
}

export function billToPreviewLines(billTo: InvoiceBillTo | null): string {
  if (!billTo) return "temple portal · admin email";
  const lines = [
    billTo.adminName,
    billTo.adminEmail,
    billTo.portalUrl,
    billTo.addressLine,
  ].filter((line) => line.trim().length > 0);
  return lines.length > 0 ? lines.join("\n") : "—";
}

export function invoiceBillToFromTempleDetail(
  detail: SuperAdminTempleDetail,
  portalUrl: string
): InvoiceBillTo {
  const { temple, admin } = detail;
  const addressParts = [temple.address, temple.city, temple.country].filter((p) => p?.trim());
  return {
    templeName: temple.name,
    adminName: admin.fullName?.trim() || "",
    adminEmail: admin.email?.trim() || "",
    portalUrl: portalUrl.trim(),
    addressLine: addressParts.join(", "),
  };
}

export function mergeTempleOptionFromDetail(
  option: { tenantId: string; name: string; portalUrl: string; adminEmail: string },
  detail: SuperAdminTempleDetail,
  portalUrl: string
): { tenantId: string; name: string; portalUrl: string; adminEmail: string } {
  return {
    ...option,
    name: detail.temple.name || option.name,
    portalUrl: portalUrl || option.portalUrl,
    adminEmail: detail.admin.email?.trim() || option.adminEmail,
  };
}
