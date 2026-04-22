import { jsonApiErrorMessage } from "@/lib/api-envelope";

export type SubmitTempleOnboardingCompletePayload = {
  sessionEmail: string;
  templeId: string;
};

export type SubmitTempleOnboardingCompleteResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTempleOnboardingComplete(
  payload: SubmitTempleOnboardingCompletePayload,
): Promise<SubmitTempleOnboardingCompleteResult> {
  const response = await fetch("/api/temple-admin/onboarding-complete", {
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
