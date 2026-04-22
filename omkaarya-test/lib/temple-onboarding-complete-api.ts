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
