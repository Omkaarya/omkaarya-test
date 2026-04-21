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
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as {
    error?: string;
    message?: string;
  } | null;

  if (response.ok) {
    return { ok: true };
  }

  const message =
    (data && typeof data.error === "string" && data.error) ||
    (data && typeof data.message === "string" && data.message) ||
    "Something went wrong. Please try again.";

  return { ok: false, message };
}
