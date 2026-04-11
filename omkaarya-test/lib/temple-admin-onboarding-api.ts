import { apiUrl } from "./api-base";

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
  const response = await fetch(apiUrl("/api/temple-admin/profile"), {
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
