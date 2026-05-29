/** Build and download a CSV for subscription list rows. */
export type SubscriptionCsvRow = {
  templeName: string;
  plan: string;
  billingCycle: string;
  amountCents: number;
  paymentDate: string;
  expiresOn: string;
  status: string;
  adminEmail: string;
  receiptId: string | null;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatUsd(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function downloadSubscriptionsCsv(rows: SubscriptionCsvRow[], filename = "subscriptions.csv"): void {
  const headers = [
    "Temple",
    "Plan",
    "Billing Cycle",
    "Amount (USD)",
    "Payment Date",
    "Expires On",
    "Status",
    "Admin Email",
    "Receipt ID",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escapeCsvCell(r.templeName),
        escapeCsvCell(r.plan),
        escapeCsvCell(r.billingCycle),
        formatUsd(r.amountCents),
        escapeCsvCell(r.paymentDate),
        escapeCsvCell(r.expiresOn),
        escapeCsvCell(r.status),
        escapeCsvCell(r.adminEmail),
        escapeCsvCell(r.receiptId ?? ""),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
