/**
 * Platform receiving account shown on temple onboarding payment and super-admin invoices.
 * Keep in sync with temple-admin onboarding payment instructions.
 */
export const OMKAARYA_PLATFORM_BANK_DETAILS = {
  header: "Peopleux Pvt Ltd — Receiving Account",
  fields: [
    { label: "Bank Name", value: "Commercial Bank of Ceylon PLC" },
    { label: "Branch Name", value: "Jaffna Main Branch" },
    { label: "Account Name", value: "Peopleux Pvt Ltd" },
    { label: "Account Number", value: "8010567890012" },
    { label: "SWIFT / BIC Code", value: "CCEYLKLX" },
  ],
  paymentTerms:
    "Include the payment reference in your bank transfer remarks. Transfers are verified within 2–3 business days after the slip is received.",
} as const;

export type PlatformBankDetailsFlat = {
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  notes: string;
};

export function flatPlatformBankDetails(): PlatformBankDetailsFlat {
  const byLabel = Object.fromEntries(
    OMKAARYA_PLATFORM_BANK_DETAILS.fields.map((f) => [f.label, f.value])
  ) as Record<string, string>;
  return {
    bankName: byLabel["Bank Name"] ?? "—",
    branchName: byLabel["Branch Name"] ?? "—",
    accountName: byLabel["Account Name"] ?? "—",
    accountNumber: byLabel["Account Number"] ?? "—",
    swift: byLabel["SWIFT / BIC Code"] ?? "—",
    notes: OMKAARYA_PLATFORM_BANK_DETAILS.paymentTerms,
  };
}
