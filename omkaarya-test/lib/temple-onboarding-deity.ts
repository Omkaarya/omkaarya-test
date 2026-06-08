/** Deity selection draft during onboarding (sessionStorage; persisted to ops DB on Save & Continue). */

export const TEMPLE_ONBOARDING_DEITY_DRAFT_KEY = "temple_onboarding_deity_draft";

export type DeitySessionProfileSlice = {
  primaryDeityId: string | null;
  subDeityIds: string[];
};

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

export function deityDraftFromSessionProfile(
  deity: DeitySessionProfileSlice,
): TempleOnboardingDeityDraft | null {
  const primary = deity.primaryDeityId?.trim();
  if (!primary) return null;
  return {
    primaryDeityId: primary,
    subDeityIds: Array.isArray(deity.subDeityIds)
      ? deity.subDeityIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [],
    completed: true,
  };
}

/** Seeds session draft from ops DB when super-admin already chose a primary deity. */
export function hydrateDeityDraftFromSessionProfile(
  deity: DeitySessionProfileSlice,
): TempleOnboardingDeityDraft | null {
  const existing = loadTempleOnboardingDeityDraft();
  if (existing?.primaryDeityId) return existing;
  const fromServer = deityDraftFromSessionProfile(deity);
  if (fromServer) {
    saveTempleOnboardingDeityDraft(fromServer);
    return fromServer;
  }
  return existing;
}

export function isDeitySelectionComplete(): boolean {
  const draft = loadTempleOnboardingDeityDraft();
  return Boolean(draft?.completed && draft.primaryDeityId);
}
