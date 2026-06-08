export type BillingIssuer = {
  name: string;
  address: string;
  email: string;
  website: string;
  brandLine: string;
};

export type BillingBankDetails = {
  bankName: string;
  branchName?: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  notes: string;
  header?: string;
};

export type InvoiceBillToBlock = {
  templeName: string;
  adminName?: string;
  adminEmail?: string;
  addressLine?: string;
  portalUrl?: string;
};

export type InvoiceLineItem = {
  description: string;
  subtitle?: string;
  qty: number;
  unitPriceCents: number;
  amountCents: number;
};

export type InvoiceDocumentData = {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string | null;
  statusLabel?: string;
  issuer: BillingIssuer;
  billTo: InvoiceBillToBlock;
  lineItems: InvoiceLineItem[];
  currency: string;
  taxRateBps?: number;
  taxLabel?: string;
  paymentMethodLabel?: string;
  bank?: BillingBankDetails;
  paymentReference?: string;
  showBankBlock?: boolean;
};

export type BillingProfile = {
  issuer: BillingIssuer;
  paymentMethodLabel: string;
  bank: Omit<BillingBankDetails, "branchName" | "header">;
  tax: { rateBps: number; label: string };
  money: { currency: string };
};
