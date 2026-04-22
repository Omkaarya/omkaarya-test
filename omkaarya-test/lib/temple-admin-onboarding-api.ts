import { jsonApiErrorMessage } from "@/lib/api-envelope";

export type SubmitTempleAdminProfilePayload = {
  sessionEmail: string;
  fullName: string;
  email: string;
  roles: string[];
  phone: string;
};

export type SubmitTempleAdminProfileResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function submitTempleAdminProfile(
  payload: SubmitTempleAdminProfilePayload,
): Promise<SubmitTempleAdminProfileResult> {
  const response = await fetch("/api/temple-admin/profile", {
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
