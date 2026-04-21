export type SubmitTempleDeitySelectionPayload = {
  sessionEmail: string;
  templeId: string;
  primaryDeityId: string;
  subDeityIds: string[];
  customDeityNote?: string;
  preferCustomLater?: boolean;
};

export type SubmitTempleDeitySelectionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTempleDeitySelection(
  payload: SubmitTempleDeitySelectionPayload,
): Promise<SubmitTempleDeitySelectionResult> {
  const response = await fetch("/api/temple-admin/deity-selection", {
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
