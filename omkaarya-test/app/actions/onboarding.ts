"use server";

import { fetchInternalApiJson } from "@/lib/server/internal-api";

type OkResult = { ok: true };
type ErrResult = { ok: false; status: number; message: string };

export type SubmitTempleAdminProfilePayload = {
  sessionEmail: string;
  fullName: string;
  email: string;
  roles: string[];
  phone: string;
};

export async function submitTempleAdminProfileAction(
  payload: SubmitTempleAdminProfilePayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/profile",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, message: res.message };
}

export type SubmitTempleDeitySelectionPayload = {
  sessionEmail: string;
  templeId: string;
  primaryDeityId: string;
  subDeityIds: string[];
  customDeityNote?: string;
  preferCustomLater?: boolean;
};

export async function submitTempleDeitySelectionAction(
  payload: SubmitTempleDeitySelectionPayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/deity-selection",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, message: res.message };
}

export type SubmitTemplePlanSelectionPayload = {
  sessionEmail: string;
  templeId: string;
  planId: "basic" | "business" | "enterprise";
  billing: "monthly" | "annual";
  confirmedAt?: string;
};

export async function submitTemplePlanSelectionAction(
  payload: SubmitTemplePlanSelectionPayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/plan-selection",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, message: res.message };
}

export type SubmitTemplePaymentOnboardingPayload = {
  sessionEmail: string;
  templeId: string;
  payment: {
    cardBrand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string;
    billingEmail: string;
    billingPhone: string;
    billingAddress: string;
  };
  agreedToTerms: boolean;
  agreedAt?: string;
};

export async function submitTemplePaymentOnboardingAction(
  payload: SubmitTemplePaymentOnboardingPayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/payment-onboarding",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, message: res.message };
}

export type SubmitTempleOnboardingCompletePayload = {
  sessionEmail: string;
  templeId: string;
  completedAt?: string;
};

export async function submitTempleOnboardingCompleteAction(
  payload: SubmitTempleOnboardingCompletePayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/onboarding-complete",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, message: res.message };
}

