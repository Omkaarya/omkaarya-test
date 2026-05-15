/** Normalize a bank transfer reference (matches temple onboarding payment step). */
export function normalizePaymentReference(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function buildTempleInvoicePaymentReference(templeName: string, tenantId: string): string {
  const name = templeName.trim() || "TEMPLE";
  const id = tenantId.trim() || "0000";
  return normalizePaymentReference(`${name}-INV-${id}`);
}
