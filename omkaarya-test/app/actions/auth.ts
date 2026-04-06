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
  const res = await fetchInternalApiJson<{
    success: boolean;
    firstLogin?: boolean;
    message?: string;
  }>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (res.ok) {
    return {
      ok: true,
      firstLogin: res.data.firstLogin !== false,
      message: typeof res.data.message === "string" ? res.data.message : "Login successful",
    };
  }

  return { ok: false, status: res.status, message: res.message };
}

export type SetPasswordActionResult =
  | { ok: true; message: string }
  | { ok: false; status: number; message: string };

export async function setPasswordAction(input: {
  email: string;
  tempPassword: string;
  newPassword: string;
}): Promise<SetPasswordActionResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>("/api/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });

  if (res.ok) {
    return { ok: true, message: typeof res.data.message === "string" ? res.data.message : "Password updated" };
  }

  return { ok: false, status: res.status, message: res.message };
}

