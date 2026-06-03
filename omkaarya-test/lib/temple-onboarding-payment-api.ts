import { jsonApiErrorMessage } from "@/lib/api-envelope";

export type SubmitTemplePaymentOnboardingPayload = {
  sessionEmail: string;
  templeId: string;
  saveCardPreferred: boolean;
};

export type SubmitTemplePaymentOnboardingResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTemplePaymentOnboarding(
  payload: SubmitTemplePaymentOnboardingPayload,
): Promise<SubmitTemplePaymentOnboardingResult> {
  const response = await fetch("/api/temple-admin/payment-onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (response.ok) {
    return { ok: true };
  }

  return { ok: false, message: jsonApiErrorMessage(data) || "Something went wrong. Please try again." };
}
