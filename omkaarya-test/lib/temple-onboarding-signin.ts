/** Non-secret identifier for onboarding context. */
export const TEMPLE_ONBOARDING_EMAIL_KEY = "temple_onboarding_email";

/** Non-secret remember-me preference for onboarding UI. */
export const TEMPLE_ONBOARDING_REMEMBER_ME_KEY = "temple_onboarding_remember_me";

/** Non-secret invite prefill: admin full name. */
export const TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY = "temple_onboarding_invite_full_name";

/** Non-secret step-3 draft payload (JSON). */
export const TEMPLE_ONBOARDING_ADMIN_PROFILE_DRAFT_KEY = "temple_onboarding_admin_profile_draft";

export type TempleAdminRole =
  | "Temple Admin"
  | "Head Priest"
  | "Trustee"
  | "Manager"
  | "Accountant";

export type TempleAdminProfileDraft = {
  fullName: string;
  email: string;
  roles: TempleAdminRole[];
  whatsapp: { countryCode: string; nationalNumber: string };
};

export function loadTempleAdminProfileDraft(): Partial<TempleAdminProfileDraft> | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_ADMIN_PROFILE_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<TempleAdminProfileDraft>;
  } catch {
    return null;
  }
}

export function saveTempleAdminProfileDraft(next: Partial<TempleAdminProfileDraft>): void {
  if (typeof window === "undefined") return;
  const prev = loadTempleAdminProfileDraft() ?? {};
  const merged = { ...prev, ...next };
  sessionStorage.setItem(TEMPLE_ONBOARDING_ADMIN_PROFILE_DRAFT_KEY, JSON.stringify(merged));
}
