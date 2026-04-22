import { jsonApiErrorMessage } from "@/lib/api-envelope";

export type SubmitTemplePlanSelectionPayload = {
  sessionEmail: string;
  templeId: string;
  pricingPlanId: string;
  billing: "monthly" | "annual";
  confirmedAt?: string;
};

export type SubmitTemplePlanSelectionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTemplePlanSelection(
  payload: SubmitTemplePlanSelectionPayload
): Promise<SubmitTemplePlanSelectionResult> {
  const response = await fetch("/api/temple-admin/plan-selection", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (response.ok) {
    return { ok: true };
  }

  return { ok: false, message: jsonApiErrorMessage(data) || "Something went wrong. Please try again." };
}
