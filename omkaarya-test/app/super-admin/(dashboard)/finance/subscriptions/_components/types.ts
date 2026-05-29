export type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";
export type BillingCycle = "Monthly" | "Annual";

export type SubscriptionRow = {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  templeName: string;
  templeInitials: string;
  plan: string;
  billingCycle: BillingCycle | string;
  amountCents: number;
  paymentDate: string;
  receiptId: string | null;
  status: SubscriptionStatus;
  verifiedBy: string | null;
  activatedOn: string | null;
  expiresOn: string;
  adminEmail: string;
};

export type PricingPlanOption = {
  id: string;
  name: string;
  priceMonthlyCents: number;
  priceYearlyCents: number;
};
