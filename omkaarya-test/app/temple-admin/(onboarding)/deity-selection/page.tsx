"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HelpCircle, Info, Search, X } from "lucide-react";
import TextInput from "@/app/components/admin/TextInput";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { TEMPLE_ONBOARDING_EMAIL_KEY } from "@/lib/temple-onboarding-signin";
import {
  DEITY_CATALOG,
  filterDeitiesByQuery,
  getDeityById,
  type DeityCatalogEntry,
} from "@/lib/deity-catalog";
import { submitTempleDeitySelection } from "@/lib/temple-onboarding-deity-api";
import {
  isDeitySelectionComplete,
  loadTempleOnboardingDeityDraft,
  saveTempleOnboardingDeityDraft,
} from "@/lib/temple-onboarding-deity";
import {
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleCreatedResponse,
} from "@/lib/temple-onboarding-temple-profile";

const SEARCH_DEBOUNCE_MS = 320;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function DeityPlaceholder({ entry }: { entry: DeityCatalogEntry }) {
  const initial = entry.name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br ${entry.placeholderHue} text-sm font-bold text-white shadow-inner sm:h-20`}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export default function TempleAdminDeitySelectionPage() {
  const router = useRouter();
  const primarySectionId = useId();

  const [isHydrating, setIsHydrating] = useState(true);
  const [primaryDeityId, setPrimaryDeityId] = useState<string | null>(null);
  const [subDeityIds, setSubDeityIds] = useState<string[]>([]);
  const [primarySearch, setPrimarySearch] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [customDeityNote, setCustomDeityNote] = useState("");
  const [showCustomNote, setShowCustomNote] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedPrimarySearch = useDebouncedValue(primarySearch, SEARCH_DEBOUNCE_MS);
  const debouncedSubSearch = useDebouncedValue(subSearch, SEARCH_DEBOUNCE_MS);

  const primaryList = useMemo(
    () => filterDeitiesByQuery(debouncedPrimarySearch),
    [debouncedPrimarySearch],
  );

  const subList = useMemo(() => {
    const filtered = filterDeitiesByQuery(debouncedSubSearch);
    const pid = primaryDeityId;
    return pid ? filtered.filter((d) => d.id !== pid) : filtered;
  }, [debouncedSubSearch, primaryDeityId]);

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }
    if (!isTempleOnboardingTempleCreated()) {
      router.replace("/temple-admin/temple-profile");
      return;
    }
    if (isDeitySelectionComplete()) {
      router.replace("/temple-admin/choose-plan");
      return;
    }

    const loaded = loadTempleOnboardingDeityDraft();
    if (loaded) {
      setPrimaryDeityId(loaded.primaryDeityId);
      setSubDeityIds(loaded.subDeityIds);
      if (loaded.customDeityNote) setCustomDeityNote(loaded.customDeityNote);
      if (loaded.preferCustomLater) setShowCustomNote(true);
    }
    setIsHydrating(false);
  }, [router]);

  useEffect(() => {
    if (isHydrating) return;
    saveTempleOnboardingDeityDraft({
      primaryDeityId,
      subDeityIds,
      customDeityNote,
      preferCustomLater: showCustomNote,
      completed: false,
    });
  }, [isHydrating, primaryDeityId, subDeityIds, customDeityNote, showCustomNote]);

  const toggleSub = (id: string) => {
    setSubDeityIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const removeSubChip = (id: string) => {
    setSubDeityIds((prev) => prev.filter((x) => x !== id));
  };

  const clearAllSub = () => setSubDeityIds([]);

  const handleSave = async () => {
    setSubmitAttempted(true);
    setSubmitError(null);
    if (!primaryDeityId) {
      setSubmitError("Please select a primary deity before continuing.");
      document.getElementById(primarySectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY)?.trim();
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }

    const created = loadTempleOnboardingTempleCreatedResponse();
    if (!created?.templeId) {
      setSubmitError("Temple setup is incomplete. Please finish the previous step first.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await submitTempleDeitySelection({
        sessionEmail,
        templeId: created.templeId,
        primaryDeityId,
        subDeityIds,
        customDeityNote: customDeityNote.trim() || undefined,
        preferCustomLater: showCustomNote,
      });
      if (!res.ok) {
        setSubmitError(("message" in res ? res.message : undefined) ?? "Failed to save deity selection.");
        return;
      }
      saveTempleOnboardingDeityDraft({
        primaryDeityId,
        subDeityIds,
        customDeityNote,
        preferCustomLater: showCustomNote,
        completed: true,
      });
      router.push("/temple-admin/choose-plan");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSubEntries = useMemo(
    () => subDeityIds.map((id) => getDeityById(id)).filter(Boolean) as DeityCatalogEntry[],
    [subDeityIds],
  );

  if (isHydrating) {
    return (
      <div className="w-full max-w-5xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
        <div className="animate-pulse space-y-6" aria-busy="true">
          <div className="h-8 w-48 rounded bg-zinc-200/80 dark:bg-zinc-800/80" />
          <div className="h-4 w-full max-w-xl rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="h-10 w-full rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50" />
            ))}
          </div>
          <div className="h-10 w-full rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60" />
          <div className="h-16 rounded-lg bg-rose-100/50 dark:bg-rose-950/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        Deity selection
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-[var(--text-muted)]">
        Choose the primary deity of your temple. This will be prominently displayed on your microsite.
      </p>

      <div className="mt-8 space-y-10">
        {/* Primary — desktop order; mobile: primary block first */}
        <section id={primarySectionId} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="primary-deity-search">
              Primary Deity
              <span className="text-red-500"> *</span>
            </label>
            <span className="inline-flex text-[var(--text-muted)]" title="The main deity shown on your public microsite.">
              <HelpCircle className="h-4 w-4" aria-hidden />
              <span className="sr-only">The main deity shown on your public microsite.</span>
            </span>
          </div>
          <TextInput
            id="primary-deity-search"
            placeholder="Type to search…"
            value={primarySearch}
            onChange={(e) => setPrimarySearch(e.target.value)}
            startIcon={<Search className="h-4 w-4" aria-hidden />}
            aria-invalid={submitAttempted && !primaryDeityId}
            className={submitAttempted && !primaryDeityId ? "ring-2 ring-red-400" : ""}
          />
          {!primaryDeityId && submitAttempted ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              Select a primary deity to continue.
            </p>
          ) : null}
          {!primaryDeityId && !submitAttempted ? (
            <p className="text-xs text-[var(--text-muted)]">Select one deity below.</p>
          ) : null}

          <p className="text-sm font-medium text-[var(--text-primary)]">Available deities</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {primaryList.length === 0 ? (
              <p className="col-span-full text-sm text-[var(--text-muted)]">No deities match your search.</p>
            ) : (
              primaryList.map((d) => {
                const selected = primaryDeityId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setPrimaryDeityId(d.id);
                      setSubDeityIds((prev) => prev.filter((x) => x !== d.id));
                    }}
                    className={[
                      "flex w-full flex-col overflow-hidden rounded-xl border-2 bg-[var(--surface-card)] text-left transition-colors",
                      selected
                        ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/25"
                        : "border-[var(--border-default)] hover:border-zinc-300 dark:hover:border-zinc-600",
                    ].join(" ")}
                  >
                    <div className="p-3">
                      <DeityPlaceholder entry={d} />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
                          {d.secondaryLabel ? (
                            <span className="text-sm text-[var(--text-muted)]"> {d.secondaryLabel}</span>
                          ) : null}
                        </div>
                        <span
                          className={[
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]"
                              : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
                          ].join(" ")}
                          aria-hidden
                        >
                          {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Sub-deities: on mobile, selected strip first */}
        <section className="flex flex-col gap-6 md:flex-col">
          <div className="order-2 flex flex-col gap-4 md:order-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="sub-deity-search">
                Sub deities
              </label>
              <span className="inline-flex text-[var(--text-muted)]" title="Optional sannidhis shown alongside your primary deity.">
                <HelpCircle className="h-4 w-4" aria-hidden />
                <span className="sr-only">Optional additional deities for your temple.</span>
              </span>
            </div>
            <TextInput
              id="sub-deity-search"
              placeholder="Type to search…"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              startIcon={<Search className="h-4 w-4" aria-hidden />}
            />
          </div>

          <div className="order-1 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-3 dark:border-rose-900/40 dark:bg-rose-950/25 md:order-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Selected [{selectedSubEntries.length}]
              </span>
              {selectedSubEntries.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAllSub}
                  className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                >
                  Clear all
                </button>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">No sub-deities selected yet</span>
              )}
            </div>
            {selectedSubEntries.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSubEntries.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
                  >
                    {d.name}
                    <button
                      type="button"
                      onClick={() => removeSubChip(d.id)}
                      className="rounded-full p-0.5 hover:bg-emerald-200/80 dark:hover:bg-emerald-800/80"
                      aria-label={`Remove ${d.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="order-3 space-y-3 md:order-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Available sannidhis{" "}
              <span className="font-normal text-[var(--text-muted)]">(optional — select multiple)</span>
            </p>
            <div className="max-h-[min(420px,55vh)] overflow-y-auto pr-1 sm:max-h-none">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {subList.length === 0 ? (
                  <p className="col-span-full text-sm text-[var(--text-muted)]">
                    {primaryDeityId ? "No matches, or all deities are already primary/sub filtered." : "Select a primary deity first."}
                  </p>
                ) : (
                  subList.map((d) => {
                    const checked = subDeityIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleSub(d.id)}
                        className={[
                          "flex w-full flex-col overflow-hidden rounded-xl border-2 bg-[var(--surface-card)] text-left transition-colors",
                          checked
                            ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/25"
                            : "border-[var(--border-default)] hover:border-zinc-300 dark:hover:border-zinc-600",
                        ].join(" ")}
                      >
                        <div className="p-3">
                          <DeityPlaceholder entry={d} />
                          <div className="mt-3 flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
                              {d.secondaryLabel ? (
                                <span className="text-sm text-[var(--text-muted)]"> {d.secondaryLabel}</span>
                              ) : null}
                            </div>
                            <span
                              className={[
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                                checked
                                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                                  : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
                              ].join(" ")}
                              aria-hidden
                            >
                              {checked ? (
                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                                  <path
                                    d="M2 6l3 3 5-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-primary)]" aria-hidden />
          <div className="min-w-0 flex-1 space-y-3 text-sm text-[var(--text-muted)]">
            <p>
              Don&apos;t see your deity? You can add custom deity details later in the settings.
            </p>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border-default)] accent-[var(--brand-primary)]"
                checked={showCustomNote}
                onChange={(e) => setShowCustomNote(e.target.checked)}
              />
              <span>Add a note for your admin team (optional)</span>
            </label>
            {showCustomNote ? (
              <textarea
                value={customDeityNote}
                onChange={(e) => setCustomDeityNote(e.target.value)}
                placeholder="e.g. Family kuladeivam name, spelling preferences…"
                rows={3}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--brand-primary)] placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900/50"
              />
            ) : null}
          </div>
        </div>
      </div>

      {submitError ? (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {submitError}
        </div>
      ) : null}

      <TempleOnboardingStepActions
        className="mt-8"
        onBack={() => router.push("/temple-admin/temple-profile")}
        primary={
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save & Continue"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        }
      />
    </div>
  );
}
