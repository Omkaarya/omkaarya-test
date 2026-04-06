import { apiUrl } from "./api-base";

export type SubmitTemplePlanSelectionPayload = {
  sessionEmail: string;
  templeId: string;
  planId: "basic" | "business" | "enterprise";
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
  payload: SubmitTemplePlanSelectionPayload,
): Promise<SubmitTemplePlanSelectionResult> {
  const response = await fetch(apiUrl("/api/temple-admin/plan-selection"), {
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
