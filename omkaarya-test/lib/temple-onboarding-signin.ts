/** Non-secret identifier for onboarding context. */
export const TEMPLE_ONBOARDING_EMAIL_KEY = "temple_onboarding_email";

/**
 * Temporary password used only for POST /api/set-password after first login (same tab session).
 * Cleared after a successful password update.
 */
export const TEMPLE_ONBOARDING_TEMP_PASSWORD_KEY = "temple_onboarding_temp_password";

/** Set when the user signed in with a permanent password (recurring); onboarding-complete skips local draft guards. */
export const TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY = "temple_onboarding_returning_login";

/** Non-secret remember-me preference for onboarding UI. */
export const TEMPLE_ONBOARDING_REMEMBER_ME_KEY = "temple_onboarding_remember_me";

/** Non-secret remembered email for temple admin sign-in (when remember-me is enabled). */
export const TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY = "temple_onboarding_remembered_email";

/** Non-secret invite prefill: admin full name. */
export const TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY = "temple_onboarding_invite_full_name";

/** Non-secret step-3 draft payload (JSON). */
export const TEMPLE_ONBOARDING_ADMIN_PROFILE_DRAFT_KEY = "temple_onboarding_admin_profile_draft";

/** Set when the user has viewed the read-only admin profile step and continued. */
export const TEMPLE_ONBOARDING_ADMIN_PROFILE_SEEN_KEY = "temple_onboarding_admin_profile_seen";

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

export function isTempleOnboardingAdminProfileSeen(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TEMPLE_ONBOARDING_ADMIN_PROFILE_SEEN_KEY) === "1";
}

export function markTempleOnboardingAdminProfileSeen(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TEMPLE_ONBOARDING_ADMIN_PROFILE_SEEN_KEY, "1");
}
