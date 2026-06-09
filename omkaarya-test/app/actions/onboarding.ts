"use server";

import { fetchInternalApiJson } from "@/lib/server/internal-api";

type OkResult = { ok: true };
type ErrResult = { ok: false; status: number; message: string };

export type GetTempleAdminProfileResult =
  | {
      ok: true;
      profile: {
        email: string;
        fullName: string;
        phone: string;
        roles: string[];
        profileImageUrl: string | null;
      };
    }
  | ErrResult;

export async function getTempleAdminProfileAction(sessionEmail: string): Promise<GetTempleAdminProfileResult> {
  const search = new URLSearchParams({ sessionEmail });
  const res = await fetchInternalApiJson<{
    success: boolean;
    profile?: {
      email: string;
      fullName: string;
      phone: string;
      roles: string[];
      profileImageUrl?: string | null;
    };
  }>(`/api/temple-admin/profile?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      status: "status" in res ? res.status : 500,
      message: res.message ?? "Failed to load profile",
    };
  }

  const profile = res.data.profile;
  if (!profile) {
    return { ok: false, status: 502, message: "Profile response missing profile payload." };
  }
  return {
    ok: true,
    profile: {
      ...profile,
      profileImageUrl: profile.profileImageUrl ?? null,
    },
  };
}

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
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to submit profile",
  };
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
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to submit deity selection",
  };
}

export type SubmitTemplePlanSelectionPayload = {
  sessionEmail: string;
  templeId: string;
  pricingPlanId: string;
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
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to submit plan selection",
  };
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
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to submit payment onboarding",
  };
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
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to complete onboarding",
  };
}

export type TempleSessionProfileCore = {
  templeName: string;
  charity: { registered: boolean; registrationNumber: string };
  email: string;
  phone: { countryCode: string; nationalNumber: string };
  whatsapp: { countryCode: string; nationalNumber: string };
  tradition: string;
  location: { countryIso: string; city: string };
};

export type TempleSessionProfileDetails = {
  logoDataUrl: string | null;
  websiteUrl: string;
  fax: { countryCode: string; nationalNumber: string };
  domainSubdomain: string;
  establishedYear: string;
  fullAddress: {
    countryIso: string;
    state: string;
    city: string;
    postalCode: string;
    street: string;
  };
};

export type TempleSessionProvisioningPlan = {
  pricingPlanId: string | null;
  planName: string | null;
  billing: "monthly" | "annual";
};

export type TempleSessionDeity = {
  primaryDeityId: string | null;
  subDeityIds: string[];
};

export type GetTempleSessionProfileResult =
  | {
      ok: true;
      templeId: string;
      core: TempleSessionProfileCore;
      details: TempleSessionProfileDetails;
      provisioningPlan: TempleSessionProvisioningPlan;
      deity: TempleSessionDeity;
    }
  | ErrResult;

export async function getTempleSessionProfileAction(sessionEmail: string): Promise<GetTempleSessionProfileResult> {
  const search = new URLSearchParams({ sessionEmail });
  const res = await fetchInternalApiJson<{
    success: boolean;
    templeId: string;
    core: TempleSessionProfileCore;
    details: TempleSessionProfileDetails;
    provisioningPlan?: TempleSessionProvisioningPlan;
    deity?: TempleSessionDeity;
  }>(`/api/temple-admin/temple-profile?${search.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      status: "status" in res ? res.status : 500,
      message: res.message ?? "Failed to load temple profile",
    };
  }
  if (!res.data.templeId || !res.data.core || !res.data.details) {
    return { ok: false, status: 502, message: "Invalid temple profile response." };
  }
  const provisioningPlan: TempleSessionProvisioningPlan = res.data.provisioningPlan ?? {
    pricingPlanId: null,
    planName: null,
    billing: "annual",
  };
  const deity: TempleSessionDeity = res.data.deity ?? {
    primaryDeityId: null,
    subDeityIds: [],
  };
  return {
    ok: true,
    templeId: res.data.templeId,
    core: res.data.core,
    details: res.data.details,
    provisioningPlan,
    deity,
  };
}

export type SaveTempleProfileDetailsPayload = {
  sessionEmail: string;
  websiteUrl: string;
  fax: { countryCode: string; nationalNumber: string };
  domainSubdomain: string;
  establishedYear: string;
  fullAddress: TempleSessionProfileDetails["fullAddress"];
  logoDataUrl: string | null;
  charityRegistered: boolean;
  charityRegistrationNumber: string;
};

export async function saveTempleProfileDetailsAction(
  payload: SaveTempleProfileDetailsPayload,
): Promise<OkResult | ErrResult> {
  const res = await fetchInternalApiJson<{ success: boolean; message?: string }>(
    "/api/temple-admin/temple-profile",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (res.ok) return { ok: true };
  return {
    ok: false,
    status: "status" in res ? res.status : 500,
    message: res.message ?? "Failed to save temple profile details",
  };
}

