/** Temple profile setup draft (tenant-specific) saved during onboarding. */

export const TEMPLE_ONBOARDING_TEMPLE_PROFILE_DRAFT_KEY =
  "temple_onboarding_temple_profile_draft";

export const TEMPLE_ONBOARDING_TEMPLE_CREATED_KEY = "temple_onboarding_temple_created";

export const TEMPLE_ONBOARDING_TEMPLE_CREATED_RESPONSE_KEY =
  "temple_onboarding_temple_created_response";

export type PhoneRowValue = {
  /** Dial code like "+91" */
  countryCode: string;
  /** National number without dial code */
  nationalNumber: string;
};

export type CharityRegistrationDraft = {
  registered: boolean;
  registrationNumber: string;
};

export type TempleFullAddressDraft = {
  /** ISO country code (e.g. "GB", "IN") */
  countryIso: string;
  /** State / Province (label based) */
  state: string;
  /** City / District */
  city: string;
  /** Postal / ZIP code */
  postalCode: string;
  /** Street / area line */
  street: string;
};

export type TempleLocationDraft = {
  countryIso: string;
  city: string;
};

export type TempleOnboardingTempleProfileDraft = {
  templeName: string;
  charity: CharityRegistrationDraft;
  email: string;
  /** Primary phone input */
  phone: PhoneRowValue;
  /** Whatsapp number input */
  whatsapp: PhoneRowValue;
  /** Fax (same shape as super-admin create-temple) */
  fax: PhoneRowValue;
  location: TempleLocationDraft;
  logoDataUrl: string | null;
  websiteUrl: string;
  domainSubdomain: string;
  establishedYear: string;
  fullAddress: TempleFullAddressDraft;
};

export type TempleCreateResult = {
  templeId: string;
};

export function loadTempleOnboardingTempleProfileDraft(): Partial<TempleOnboardingTempleProfileDraft> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_TEMPLE_PROFILE_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<TempleOnboardingTempleProfileDraft>;
  } catch {
    return null;
  }
}

export function saveTempleOnboardingTempleProfileDraft(
  next: Partial<TempleOnboardingTempleProfileDraft>,
): void {
  if (typeof window === "undefined") return;
  const prev = loadTempleOnboardingTempleProfileDraft() ?? {};
  const merged: Partial<TempleOnboardingTempleProfileDraft> = {
    ...prev,
    ...next,
  };

  // Ensure nested objects remain mergeable where the UI updates individual fields.
  if (prev.charity || next.charity) {
    merged.charity = { ...(prev.charity ?? { registered: false, registrationNumber: "" }), ...(next.charity ?? {}) };
  }
  if (prev.phone || next.phone) merged.phone = { ...(prev.phone ?? { countryCode: "", nationalNumber: "" }), ...(next.phone ?? {}) };
  if (prev.whatsapp || next.whatsapp)
    merged.whatsapp = { ...(prev.whatsapp ?? { countryCode: "", nationalNumber: "" }), ...(next.whatsapp ?? {}) };
  if (prev.fax || next.fax)
    merged.fax = { ...(prev.fax ?? { countryCode: "", nationalNumber: "" }), ...(next.fax ?? {}) };
  if (prev.location || next.location) merged.location = { ...(prev.location ?? { countryIso: "", city: "" }), ...(next.location ?? {}) };
  if (prev.fullAddress || next.fullAddress)
    merged.fullAddress = { ...(prev.fullAddress ?? { countryIso: "", state: "", city: "", postalCode: "", street: "" }), ...(next.fullAddress ?? {}) };

  sessionStorage.setItem(
    TEMPLE_ONBOARDING_TEMPLE_PROFILE_DRAFT_KEY,
    JSON.stringify(merged),
  );
}

export function clearTempleOnboardingTempleProfileDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TEMPLE_ONBOARDING_TEMPLE_PROFILE_DRAFT_KEY);
}

export function isTempleOnboardingTempleCreated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TEMPLE_ONBOARDING_TEMPLE_CREATED_KEY) === "1";
}

export function loadTempleOnboardingTempleCreatedResponse(): TempleCreateResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_TEMPLE_CREATED_RESPONSE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const maybe = parsed as Partial<TempleCreateResult>;
    if (!maybe.templeId) return null;
    return { templeId: String(maybe.templeId) };
  } catch {
    return null;
  }
}

export function markTempleOnboardingTempleCreated(result: TempleCreateResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TEMPLE_ONBOARDING_TEMPLE_CREATED_KEY, "1");
  sessionStorage.setItem(TEMPLE_ONBOARDING_TEMPLE_CREATED_RESPONSE_KEY, JSON.stringify(result));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      if (typeof reader.result !== "string") return reject(new Error("Invalid file reader result"));
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

