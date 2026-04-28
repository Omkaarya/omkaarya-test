import { jsonApiErrorMessage } from "@/lib/api-envelope";

export type SubmitTempleBankTransferNotificationPayload = {
  sessionEmail: string;
  templeId: string;
  paymentRef: string;
  amountCents: number;
  currency: string;
  transferredDate: string; // YYYY-MM-DD
  notes?: string;
  /** Optional: UUID of a pending payable invoice for this temple */
  invoiceId?: string;
  slipFile: File;
};

export type SubmitTempleBankTransferNotificationResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTempleBankTransferNotification(
  payload: SubmitTempleBankTransferNotificationPayload
): Promise<SubmitTempleBankTransferNotificationResult> {
  const form = new FormData();
  form.set("sessionEmail", payload.sessionEmail);
  form.set("templeId", payload.templeId);
  form.set("paymentRef", payload.paymentRef);
  form.set("amountCents", String(payload.amountCents));
  form.set("currency", payload.currency);
  form.set("transferredDate", payload.transferredDate);
  if (payload.notes) form.set("notes", payload.notes);
  if (payload.invoiceId) form.set("invoiceId", payload.invoiceId);
  form.set("slip", payload.slipFile, payload.slipFile.name);

  const response = await fetch("/api/temple-admin/payment-submissions", {
    method: "POST",
    body: form,
  });

  const data = (await response.json().catch(() => null)) as unknown;
  if (response.ok) return { ok: true };
  return { ok: false, message: jsonApiErrorMessage(data) || "Something went wrong. Please try again." };
}

