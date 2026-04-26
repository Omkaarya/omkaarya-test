/** Fired when pending payment-submission list changes (e.g. after confirm/reject) so the admin shell can refresh the bell count. */
export const PENDING_PAYMENT_SUBMISSIONS_CHANGED_EVENT =
  "omkaarya:pending-payment-submissions-changed" as const;

export function dispatchPendingPaymentSubmissionsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PENDING_PAYMENT_SUBMISSIONS_CHANGED_EVENT),
  );
}
