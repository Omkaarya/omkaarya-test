import type { InvoiceBillToBlock, InvoiceDocumentData, InvoiceLineItem } from "./invoice-types";
import { formatInvoiceDate, resolveAdminDisplayName, resolveBillingBankDetails, resolveBillingProfile } from "./invoice-defaults";
import type { BillingProfile } from "./invoice-types";
import type { InvoiceBillTo } from "@/lib/invoice-temple-prefill";

export function mapBillToFromPrefill(billTo: InvoiceBillTo | null | undefined): InvoiceBillToBlock {
  if (!billTo) {
    return { templeName: "—", adminName: "—", adminEmail: "—", addressLine: "—", portalUrl: "—" };
  }
  return {
    templeName: billTo.templeName || "—",
    adminName: billTo.adminName || resolveAdminDisplayName({ email: billTo.adminEmail }),
    adminEmail: billTo.adminEmail || "—",
    addressLine: billTo.addressLine || "—",
    portalUrl: billTo.portalUrl || "—",
  };
}

export function buildInvoiceDocumentFromListRow(input: {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string | null;
  statusLabel?: string;
  templeName: string;
  templeAddress?: string;
  adminEmail?: string;
  adminName?: string;
  plan: string;
  period: string;
  amountCents: number;
  currency: string;
  profile: BillingProfile | null;
  paymentReference?: string;
}): InvoiceDocumentData {
  const resolved = resolveBillingProfile(input.profile);
  const lineItems: InvoiceLineItem[] = [
    {
      description: `${input.plan} subscription`,
      subtitle: input.period,
      qty: 1,
      unitPriceCents: input.amountCents,
      amountCents: input.amountCents,
    },
  ];
  return {
    invoiceNumber: input.invoiceNumber,
    issuedDate: input.issuedDate,
    dueDate: input.dueDate,
    statusLabel: input.statusLabel,
    issuer: resolved.issuer,
    billTo: {
      templeName: input.templeName,
      adminName: input.adminName || resolveAdminDisplayName({ email: input.adminEmail }),
      adminEmail: input.adminEmail,
      addressLine: input.templeAddress,
    },
    lineItems,
    currency: input.currency || resolved.money.currency,
    taxRateBps: resolved.tax.rateBps,
    taxLabel: resolved.tax.label,
    paymentMethodLabel: resolved.paymentMethodLabel,
    bank: resolveBillingBankDetails(resolved),
    paymentReference: input.paymentReference ?? input.invoiceNumber,
    showBankBlock: true,
  };
}

export { formatInvoiceDate };
