/** Marks payment step finished in onboarding (session-only; no card data stored). */

export const TEMPLE_ONBOARDING_PAYMENT_STATUS_KEY = "temple_onboarding_payment_status";

export type TempleOnboardingPaymentStatus = {
  completedAt: string;
  saveCardPreferred?: boolean;
};

export function loadTempleOnboardingPaymentStatus(): TempleOnboardingPaymentStatus | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_PAYMENT_STATUS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Partial<TempleOnboardingPaymentStatus>;
    if (typeof o.completedAt !== "string") return null;
    return {
      completedAt: o.completedAt,
      saveCardPreferred: typeof o.saveCardPreferred === "boolean" ? o.saveCardPreferred : undefined,
    };
  } catch {
    return null;
  }
}

export function saveTempleOnboardingPaymentComplete(saveCardPreferred: boolean): void {
  if (typeof window === "undefined") return;
  const payload: TempleOnboardingPaymentStatus = {
    completedAt: new Date().toISOString(),
    saveCardPreferred,
  };
  sessionStorage.setItem(TEMPLE_ONBOARDING_PAYMENT_STATUS_KEY, JSON.stringify(payload));
}

export function clearTempleOnboardingPaymentStatus(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TEMPLE_ONBOARDING_PAYMENT_STATUS_KEY);
}
