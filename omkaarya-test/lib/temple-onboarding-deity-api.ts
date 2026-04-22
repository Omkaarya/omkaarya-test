import { jsonApiErrorMessage } from "@/lib/api-envelope";

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

  const data = (await response.json().catch(() => null)) as unknown;

  if (response.ok) {
    return { ok: true };
  }

  return { ok: false, message: jsonApiErrorMessage(data) || "Something went wrong. Please try again." };
}
