/** Deity selection draft during onboarding (session-only; no API persistence in this milestone). */

export const TEMPLE_ONBOARDING_DEITY_DRAFT_KEY = "temple_onboarding_deity_draft";

export type TempleOnboardingDeityDraft = {
  primaryDeityId: string | null;
  subDeityIds: string[];
  customDeityNote?: string;
  preferCustomLater?: boolean;
  /** True after user clicks Save & Continue on deity-selection */
  completed?: boolean;
};

const defaultDraft: TempleOnboardingDeityDraft = {
  primaryDeityId: null,
  subDeityIds: [],
  completed: false,
};

export function loadTempleOnboardingDeityDraft(): TempleOnboardingDeityDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(TEMPLE_ONBOARDING_DEITY_DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Partial<TempleOnboardingDeityDraft>;
    return {
      ...defaultDraft,
      ...o,
      primaryDeityId: typeof o.primaryDeityId === "string" || o.primaryDeityId === null ? o.primaryDeityId : null,
      subDeityIds: Array.isArray(o.subDeityIds) ? o.subDeityIds.filter((x): x is string => typeof x === "string") : [],
      customDeityNote: typeof o.customDeityNote === "string" ? o.customDeityNote : undefined,
      preferCustomLater: typeof o.preferCustomLater === "boolean" ? o.preferCustomLater : undefined,
      completed: Boolean(o.completed),
    };
  } catch {
    return null;
  }
}

export function saveTempleOnboardingDeityDraft(next: Partial<TempleOnboardingDeityDraft>): void {
  if (typeof window === "undefined") return;
  const prev = loadTempleOnboardingDeityDraft() ?? { ...defaultDraft };
  const merged: TempleOnboardingDeityDraft = {
    ...prev,
    ...next,
    subDeityIds: next.subDeityIds ?? prev.subDeityIds,
  };
  sessionStorage.setItem(TEMPLE_ONBOARDING_DEITY_DRAFT_KEY, JSON.stringify(merged));
}

export function clearTempleOnboardingDeityDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TEMPLE_ONBOARDING_DEITY_DRAFT_KEY);
}

export function isDeitySelectionComplete(): boolean {
  return Boolean(loadTempleOnboardingDeityDraft()?.completed);
}
