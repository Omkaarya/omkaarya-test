export type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Rejected";
export type PlanName = "Prarambha" | "Sankalpa" | "Aaradhana";
export type BillingCycle = "Monthly" | "Annual";

export type SubscriptionRow = {
  id: string;
  invoiceId: string;
  templeName: string;
  templeInitials: string;
  templeAddress: string;
  plan: PlanName;
  billingCycle: BillingCycle;
  amount: number;
  paymentDate: string;
  receiptId: string;
  status: SubscriptionStatus;
  verifiedBy: string | null;
  activatedOn: string | null;
  expiresOn: string;
  adminEmail: string;
  cardLast4: string;
};
