"use server";

import { fetchInternalApiJson } from "@/lib/server/internal-api";

export type LoginActionResult =
  | { ok: true; firstLogin: boolean; message: string }
  | { ok: false; status: number; message: string };

export async function loginAction(input: {
  email: string;
  tempPassword?: string;
  password?: string;
}): Promise<LoginActionResult> {
  const res = await fetchInternalApiJson<{ firstLogin?: boolean }>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (res.ok) {
    return {
      ok: true,
      firstLogin: res.data.firstLogin !== false,
      message: res.message ?? "Login successful",
    };
  }

  // TS sometimes fails to narrow on `res.ok` across server/action boundaries.
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Login failed",
  };
}

export type SetPasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; status: number; message: string };

export async function setPasswordAction(input: {
  email: string;
  tempPassword: string;
  newPassword: string;
}): Promise<SetPasswordActionResult> {
  const res = await fetchInternalApiJson<{ passwordUpdated?: boolean }>("/api/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (res.ok) {
    return { ok: true, message: res.message ?? "Password updated" };
  }

  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to update password",
  };
}

