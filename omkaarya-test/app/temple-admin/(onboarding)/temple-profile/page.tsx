"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, HelpCircle, Loader2, Plus } from "lucide-react";
import {
  getTempleSessionProfileAction,
  saveTempleProfileDetailsAction,
  type TempleSessionProfileCore,
} from "@/app/actions/onboarding";
import { TEMPLE_ONBOARDING_EMAIL_KEY } from "@/lib/temple-onboarding-signin";
import { isDeitySelectionComplete } from "@/lib/temple-onboarding-deity";
import {
  fileToDataUrl,
  isTempleOnboardingTempleCreated,
  loadTempleOnboardingTempleProfileDraft,
  markTempleOnboardingTempleCreated,
  saveTempleOnboardingTempleProfileDraft,
  type PhoneRowValue,
  type TempleOnboardingTempleProfileDraft,
} from "@/lib/temple-onboarding-temple-profile";
import AffixedInput from "@/app/components/admin/AffixedInput";
import FormField from "@/app/components/admin/FormField";
import LogoUpload from "@/app/components/admin/LogoUpload";
import { PhoneRowField } from "@/app/components/admin/PhoneFieldsGroup";
import SelectInput from "@/app/components/admin/SelectInput";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import TextInput from "@/app/components/admin/TextInput";

export default function TempleAdminTempleProfilePage() {
  const router = useRouter();

  const templeNameId = useId();
  const emailId = useId();
  const websiteId = useId();
  const domainSubdomainId = useId();
  const establishedYearId = useId();
  const streetId = useId();
  const addressCountryId = useId();
  const stateId = useId();
  const addressCityId = useId();
  const postalCodeId = useId();
  const charityRegNumberId = useId();

  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [core, setCore] = useState<TempleSessionProfileCore | null>(null);
  const [templeIdFromServer, setTempleIdFromServer] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const LOCATION_COUNTRIES: { iso: string; label: string }[] = useMemo(
    () => [
      { iso: "LK", label: "Sri Lanka" },
      { iso: "IN", label: "India" },
      { iso: "GB", label: "United Kingdom" },
      { iso: "US", label: "United States" },
      { iso: "AU", label: "Australia" },
      { iso: "CA", label: "Canada" },
    ],
    [],
  );

  const DIAL_BY_ISO: Record<string, string> = useMemo(
    () => ({
      LK: "+94",
      IN: "+91",
      GB: "+44",
      US: "+1",
      AU: "+61",
      CA: "+1",
      AE: "+971",
      DE: "+49",
      SG: "+65",
      FR: "+33",
    }),
    [],
  );

  const STATES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = useMemo(
    () => ({
      LK: [{ value: "Northern", label: "Northern" }],
      IN: [
        { value: "Telangana", label: "Telangana" },
        { value: "Delhi", label: "Delhi" },
      ],
      GB: [{ value: "England", label: "England" }],
      US: [{ value: "NewYork", label: "New York" }],
      AU: [{ value: "NewSouthWales", label: "New South Wales" }],
      CA: [{ value: "Ontario", label: "Ontario" }],
    }),
    [],
  );

  const CITIES_BY_STATE: Record<string, { value: string; label: string }[]> = useMemo(
    () => ({
      Northern: [{ value: "Jaffna", label: "Jaffna" }],
      Telangana: [{ value: "Hyderabad", label: "Hyderabad" }],
      Delhi: [{ value: "Delhi", label: "Delhi" }],
      England: [{ value: "London", label: "London" }],
      NewYork: [{ value: "New York", label: "New York" }],
      NewSouthWales: [{ value: "Sydney", label: "Sydney" }],
      Ontario: [{ value: "Toronto", label: "Toronto" }],
    }),
    [],
  );

  const POSTAL_CODES_BY_CITY: Record<string, { value: string; label: string }[]> = useMemo(
    () => ({
      Jaffna: [
        { value: "40000", label: "40000" },
        { value: "40001", label: "40001" },
        { value: "40002", label: "40002" },
      ],
      Hyderabad: [
        { value: "500001", label: "500001" },
        { value: "500002", label: "500002" },
      ],
      London: [
        { value: "EC1A", label: "EC1A" },
        { value: "SW1A", label: "SW1A" },
      ],
      "New York": [
        { value: "10001", label: "10001" },
        { value: "10002", label: "10002" },
      ],
      Delhi: [
        { value: "110001", label: "110001" },
        { value: "110002", label: "110002" },
      ],
      Sydney: [
        { value: "2000", label: "2000" },
        { value: "2001", label: "2001" },
      ],
      Toronto: [
        { value: "M4B1B3", label: "M4B1B3" },
        { value: "M5G1C9", label: "M5G1C9" },
      ],
    }),
    [],
  );

  const initialPhone = useMemo<PhoneRowValue>(
    () => ({
      countryCode: "+94",
      nationalNumber: "",
    }),
    [],
  );

  const [draft, setDraft] = useState<TempleOnboardingTempleProfileDraft>(() => ({
    templeName: "",
    charity: { registered: false, registrationNumber: "" },
    email: "",
    phone: initialPhone,
    whatsapp: initialPhone,
    fax: initialPhone,
    location: { countryIso: "LK", city: "" },
    logoDataUrl: null,
    websiteUrl: "",
    domainSubdomain: "",
    establishedYear: "",
    fullAddress: { countryIso: "LK", state: "", city: "", postalCode: "", street: "" },
  }));

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }

    if (isTempleOnboardingTempleCreated()) {
      router.replace(
        isDeitySelectionComplete() ? "/temple-admin/choose-plan" : "/temple-admin/deity-selection",
      );
      return;
    }

    let cancelled = false;

    const run = async () => {
      const res = await getTempleSessionProfileAction(email);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.message || "Could not load profile.");
        setIsHydrating(false);
        return;
      }
      setCore(res.core);
      setTempleIdFromServer(res.templeId);

      const loadedDraft = loadTempleOnboardingTempleProfileDraft();
      const faxDial =
        (loadedDraft?.fax?.countryCode ?? res.details.fax.countryCode ?? "") ||
        DIAL_BY_ISO[res.details.fullAddress.countryIso] ||
        "+91";

      setDraft((prev) => ({
        ...prev,
        templeName: res.core.templeName,
        charity: loadedDraft?.charity
          ? {
              registered: loadedDraft.charity.registered,
              registrationNumber:
                loadedDraft.charity.registrationNumber ?? res.core.charity.registrationNumber,
            }
          : res.core.charity,
        email: res.core.email,
        phone: res.core.phone,
        whatsapp: res.core.phone,
        location: res.core.location,
        logoDataUrl: res.details.logoDataUrl,
        websiteUrl: loadedDraft?.websiteUrl ?? res.details.websiteUrl,
        domainSubdomain: loadedDraft?.domainSubdomain ?? res.details.domainSubdomain,
        establishedYear: loadedDraft?.establishedYear ?? res.details.establishedYear,
        fullAddress: loadedDraft?.fullAddress ?? res.details.fullAddress,
        fax: {
          countryCode: loadedDraft?.fax?.countryCode ?? faxDial,
          nationalNumber: loadedDraft?.fax?.nationalNumber ?? res.details.fax.nationalNumber,
        },
      }));

      setIsHydrating(false);
      setTimeout(() => {
        document.getElementById(websiteId)?.focus?.();
      }, 150);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [DIAL_BY_ISO, router, websiteId]);

  useEffect(() => {
    if (!isHydrating) {
      saveTempleOnboardingTempleProfileDraft({
        logoDataUrl: draft.logoDataUrl,
        websiteUrl: draft.websiteUrl,
        fax: draft.fax,
        domainSubdomain: draft.domainSubdomain,
        establishedYear: draft.establishedYear,
        fullAddress: draft.fullAddress,
        charity: draft.charity,
      });
    }
  }, [draft, isHydrating]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!logoFile) {
        return;
      }
      try {
        const url = await fileToDataUrl(logoFile);
        if (cancelled) return;
        setDraft((prev) => ({ ...prev, logoDataUrl: url }));
      } catch {
        if (cancelled) return;
        setDraft((prev) => ({ ...prev, logoDataUrl: null }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logoFile]);

  const SUBDOMAIN_RE = useMemo(() => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, []);

  /** Matches super-admin `create-temple` — optional unless the user starts typing. */
  function phoneRowErrorOptional(p: PhoneRowValue, label: string): string | undefined {
    const raw = p.nationalNumber.trim();
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, "");
    if (!digits) return `Enter a valid ${label} number.`;
    if (digits.length < 8 || digits.length > 15) return `Enter a valid ${label} number.`;
    return undefined;
  }

  function normalizeWebsiteUrl(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `http://${trimmed}`;
  }

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    const faxErr = phoneRowErrorOptional(draft.fax, "Fax");
    if (faxErr) errs.fax = faxErr;

    if (!draft.domainSubdomain.trim()) errs.domainSubdomain = "Domain URL is required.";
    else if (!SUBDOMAIN_RE.test(draft.domainSubdomain.trim())) {
      errs.domainSubdomain = "Use letters, numbers, and dashes only (no spaces).";
    }

    const yearRaw = draft.establishedYear.trim();
    if (!yearRaw) errs.establishedYear = "Established year is required.";
    else {
      const year = Number(yearRaw);
      if (!Number.isInteger(year) || year < 1800 || year > 2100) {
        errs.establishedYear = "Established year must be between 1800 and 2100.";
      }
    }

    // Validate website if provided.
   if (draft.websiteUrl.trim()) {
      const normalized = normalizeWebsiteUrl(draft.websiteUrl);
      if (!normalized) errs.websiteUrl = "Website URL is invalid.";
      else {
        try {
          new URL(normalized);
        } catch {
          errs.websiteUrl = "Enter a valid website URL (e.g. example.com).";
        }
      }
    }

    if (!draft.fullAddress.street.trim()) errs.addressStreet = "Street address is required.";
    if (!draft.fullAddress.countryIso) errs.addressCountry = "Country is required.";
    if (!draft.fullAddress.state.trim()) errs.addressState = "State is required.";
    if (!draft.fullAddress.city.trim()) errs.addressCity = "City is required.";
    if (!draft.fullAddress.postalCode.trim()) errs.addressPostalCode = "Postal code is required.";

    if (draft.charity.registered && !draft.charity.registrationNumber.trim()) {
      errs.charityRegistrationNumber = "Charity registration number is required when registered.";
    }

    const ok = Object.keys(errs).length === 0;
    return { ok, errs };
  }, [draft, SUBDOMAIN_RE]);

  const slugPreview = useMemo(() => {
    const s = draft.domainSubdomain.trim();
    return s || "temple_name";
  }, [draft.domainSubdomain]);

  const micrositeHostPreview = useMemo(
    () => `${slugPreview}.microsite.omkaarya.com`,
    [slugPreview],
  );

  const hasAnyInput = useMemo(() => {
    return Boolean(
      core &&
        (draft.domainSubdomain.trim() ||
          draft.establishedYear.trim() ||
          draft.fullAddress.street.trim() ||
          draft.fullAddress.postalCode.trim()),
    );
  }, [core, draft]);

  function focusFirstError() {
    const idsInOrder: { key: string; id: string }[] = [
      { key: "fax", id: "temple-fax-num" },
      { key: "domainSubdomain", id: domainSubdomainId },
      { key: "establishedYear", id: establishedYearId },
      { key: "addressStreet", id: streetId },
      { key: "addressCountry", id: addressCountryId },
      { key: "addressState", id: stateId },
      { key: "addressCity", id: addressCityId },
      { key: "addressPostalCode", id: postalCodeId },
      { key: "charityRegistrationNumber", id: charityRegNumberId },
    ];

    for (const { key, id } of idsInOrder) {
      if (errors.errs[key]) {
        const el = document.getElementById(id) as HTMLElement | null;
        el?.focus?.();
        break;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(null);

    if (!core || !templeIdFromServer) {
      setError("Your temple is not provisioned yet. Please contact your administrator.");
      return;
    }

    if (!hasAnyInput) {
      setError("Please complete the additional details before continuing.");
      return;
    }

    if (!errors.ok) {
      const detailKeys = [
        "websiteUrl",
        "fax",
        "domainSubdomain",
        "establishedYear",
        "addressStreet",
        "addressCountry",
        "addressState",
        "addressCity",
        "addressPostalCode",
      ];
      if (detailKeys.some((k) => errors.errs[k])) setDetailsExpanded(true);
      focusFirstError();
      return;
    }

    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }

    if (isTempleOnboardingTempleCreated()) {
      router.push(
        isDeitySelectionComplete() ? "/temple-admin/choose-plan" : "/temple-admin/deity-selection",
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveTempleProfileDetailsAction({
        sessionEmail,
        websiteUrl: draft.websiteUrl,
        fax: draft.fax,
        domainSubdomain: draft.domainSubdomain.trim(),
        establishedYear: draft.establishedYear.trim(),
        fullAddress: draft.fullAddress,
        logoDataUrl: draft.logoDataUrl,
        charityRegistered: draft.charity.registered,
        charityRegistrationNumber: draft.charity.registrationNumber.trim(),
      });
      if (!res.ok) {
        setError(res.message || "Could not save details.");
        return;
      }

      markTempleOnboardingTempleCreated({ templeId: templeIdFromServer });
      router.push("/temple-admin/deity-selection");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    // Re-check navigation if created flag is set (e.g. after back navigation).
    if (!isHydrating && isTempleOnboardingTempleCreated()) {
      router.replace(
        isDeitySelectionComplete() ? "/temple-admin/choose-plan" : "/temple-admin/deity-selection",
      );
    }
  }, [isHydrating, router]);

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
      {isHydrating ? (
        <div
          className="min-h-[420px] animate-pulse rounded-xl bg-[var(--surface-elevated)] p-6"
          aria-busy="true"
        >
          <div className="h-6 w-52 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
          <div className="mt-3 h-4 w-[70%] rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
            ))}
          </div>
          <div className="mt-8 h-12 w-40 rounded bg-zinc-200/60 dark:bg-zinc-800/60" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          <h1 className="text-2xl font-semibold tracking-tight">Set up your temple</h1>
          <p className="mt-2 text-sm" role="alert">
            {loadError}
          </p>
          <p className="mt-3 text-sm text-amber-900/80 dark:text-amber-200/90">
            Your temple must be provisioned before you can continue. Please contact your administrator.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Set up your temple
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              This appears on all devotee-facing pages, donation receipts, and communications.
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Temple name, contact, and location are managed by your organisation. Use “Add more details” below to
              complete your profile.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {core ? (
                <>
                  <FormField id={templeNameId} label="Temple Name" required layout="horizontal">
                    <TextInput
                      id={templeNameId}
                      readOnly
                      tabIndex={-1}
                      value={core.templeName}
                      className="cursor-not-allowed opacity-90"
                    />
                  </FormField>

                  <FormField id="charity-display" label="Charity registration" layout="horizontal">
                    <div className="flex flex-col gap-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                          checked={draft.charity.registered}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              charity: {
                                registered: e.target.checked,
                                registrationNumber: e.target.checked ? prev.charity.registrationNumber : "",
                              },
                            }))
                          }
                        />
                        <span className="text-sm text-[var(--text-primary)]">This temple is registered as a charity</span>
                      </label>
                      {draft.charity.registered ? (
                        <div>
                          <TextInput
                            id={charityRegNumberId}
                            value={draft.charity.registrationNumber}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                charity: { ...prev.charity, registrationNumber: e.target.value },
                              }))
                            }
                            placeholder="Official registration number"
                            aria-invalid={submitAttempted && !!errors.errs.charityRegistrationNumber}
                          />
                          {submitAttempted && errors.errs.charityRegistrationNumber ? (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                              {errors.errs.charityRegistrationNumber}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <p>Shown on donation receipts when applicable. You can complete this here if it was not set during provisioning.</p>
                      </div>
                    </div>
                  </FormField>

                  <FormField id={emailId} label="Email" required layout="horizontal">
                    <TextInput
                      id={emailId}
                      type="email"
                      readOnly
                      tabIndex={-1}
                      value={core.email}
                      className="cursor-not-allowed opacity-90"
                    />
                  </FormField>

                  <FormField id="temple-contact-ro" label="Phone number" required layout="horizontal">
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)]">
                      {core.phone.countryCode} {core.phone.nationalNumber || "—"}
                    </div>
                  </FormField>

                  <FormField id="location-ro" label="Location" required layout="horizontal">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-[var(--text-muted)]">Country</span>
                        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)]">
                          {LOCATION_COUNTRIES.find((c) => c.iso === core.location.countryIso)?.label ??
                            core.location.countryIso}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-[var(--text-muted)]">City</span>
                        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)]">
                          {core.location.city || "—"}
                        </div>
                      </div>
                    </div>
                  </FormField>
                </>
              ) : null}
            </div>

            <div>
              <div className="flex items-center gap-3 py-2">
                <div className="h-px min-h-px flex-1 bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                <button
                  type="button"
                  onClick={() => setDetailsExpanded((v) => !v)}
                  className={[
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    detailsExpanded
                      ? "border-orange-200 bg-orange-50/90 text-[var(--brand-primary)] dark:border-orange-900/50 dark:bg-orange-950/40"
                      : "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                  ].join(" ")}
                  aria-expanded={detailsExpanded}
                >
                  <Plus
                    className={["h-3.5 w-3.5 shrink-0 transition-transform duration-200", detailsExpanded ? "rotate-45" : ""].join(
                      " ",
                    )}
                    aria-hidden
                  />
                  Add more details
                  <ChevronDown
                    className={["h-3.5 w-3.5 shrink-0 transition-transform duration-200", detailsExpanded ? "rotate-180" : ""].join(
                      " ",
                    )}
                    aria-hidden
                  />
                </button>
                <div className="h-px min-h-px flex-1 bg-zinc-200 dark:bg-zinc-700" aria-hidden />
              </div>

              <div
                className={[
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  detailsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-5 pt-5">
                    <FormField id="logo" label="Your logo" hint="This will display on your profile." layout="horizontal">
                      <LogoUpload
                        file={logoFile}
                        onFileChange={setLogoFile}
                        initialDataUrl={draft.logoDataUrl}
                        placeholderLabel="Logo"
                      />
                    </FormField>

                    <FormField id={websiteId} label="Website" layout="horizontal">
                      <div>
                        <AffixedInput
                          id={websiteId}
                          prefix="http://"
                          value={draft.websiteUrl}
                          onChange={(e) => setDraft((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                          placeholder="www.example.com"
                        />
                        {submitAttempted && errors.errs.websiteUrl ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.websiteUrl}</p>
                        ) : null}
                      </div>
                    </FormField>

                    <PhoneRowField
                      idPrefix="temple-fax"
                      label="Fax number"
                      layout="horizontal"
                      value={draft.fax}
                      onChange={(next) => setDraft((prev) => ({ ...prev, fax: next }))}
                      onBlur={() => setSubmitAttempted(true)}
                      error={submitAttempted ? errors.errs.fax : undefined}
                    />

                    <FormField
                      id={domainSubdomainId}
                      label="Domain URL"
                      hint={`Microsite will be live at: ${micrositeHostPreview}`}
                      required
                      layout="horizontal"
                    >
                      <div>
                        <AffixedInput
                          id={domainSubdomainId}
                          suffix=".microsite.omkaarya.com"
                          value={draft.domainSubdomain}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const normalized = raw
                              .replace(/\s+/g, "-")
                              .toLowerCase()
                              .replace(/\.microsite\.omkaarya\.com$/i, "")
                              .replace(/\.omkaarya\.com$/i, "")
                              .replace(/[^a-z0-9-]/g, "");
                            setDraft((prev) => ({ ...prev, domainSubdomain: normalized }));
                          }}
                          placeholder="temple_name"
                          suffixAction={
                            <button
                              type="button"
                              className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                            >
                              Upgrade
                            </button>
                          }
                        />
                        {submitAttempted && errors.errs.domainSubdomain ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.domainSubdomain}</p>
                        ) : null}
                      </div>
                    </FormField>

                    <FormField id={establishedYearId} label="Established year" required layout="horizontal">
                      <div>
                        <TextInput
                          id={establishedYearId}
                          type="number"
                          min={1800}
                          max={2100}
                          placeholder="1850"
                          value={draft.establishedYear}
                          onChange={(e) => setDraft((prev) => ({ ...prev, establishedYear: e.target.value }))}
                          aria-invalid={submitAttempted && !!errors.errs.establishedYear}
                        />
                        {submitAttempted && errors.errs.establishedYear ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.establishedYear}</p>
                        ) : null}
                      </div>
                    </FormField>

                    <FormField id={streetId} label="Street / area" required layout="horizontal">
                      <div>
                        <TextInput
                          id={streetId}
                          placeholder="No 1, Main street"
                          value={draft.fullAddress.street}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              fullAddress: { ...prev.fullAddress, street: e.target.value },
                            }))
                          }
                          aria-invalid={submitAttempted && !!errors.errs.addressStreet}
                        />
                        {submitAttempted && errors.errs.addressStreet ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.addressStreet}</p>
                        ) : null}
                      </div>
                    </FormField>

                    <div className="grid gap-5 sm:col-span-4 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)]">
                      <div aria-hidden className="hidden sm:block" />
                      <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <SelectInput
                              id={addressCountryId}
                              value={draft.fullAddress.countryIso}
                              onChange={(e) => {
                                const nextIso = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  fullAddress: {
                                    ...prev.fullAddress,
                                    countryIso: nextIso,
                                    state: "",
                                    city: "",
                                    postalCode: "",
                                  },
                                }));
                              }}
                            >
                              {LOCATION_COUNTRIES.map((c) => (
                                <option key={c.iso} value={c.iso}>
                                  {c.label}
                                </option>
                              ))}
                            </SelectInput>
                            {submitAttempted && errors.errs.addressCountry ? (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.addressCountry}</p>
                            ) : null}
                          </div>


                          <div>
                            <SelectInput
                              id={stateId}
                              value={draft.fullAddress.state}
                              onChange={(e) => {
                                const nextState = e.target.value;
                                setDraft((prev) => ({
                                  ...prev,
                                  fullAddress: { ...prev.fullAddress, state: nextState, city: "", postalCode: "" },
                                }));
                              }}
                              aria-invalid={submitAttempted && !!errors.errs.addressState}
                            >
                              <option value="">Select Province/State</option>
                              {(STATES_BY_COUNTRY[draft.fullAddress.countryIso] ?? []).map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </SelectInput>
                            {submitAttempted && errors.errs.addressState ? (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.addressState}</p>
                            ) : null}
                          </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:col-span-2 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)]">
                      <div aria-hidden className="hidden sm:block" />
                      <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <SelectInput
                              id={addressCityId}
                              value={draft.fullAddress.city}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  fullAddress: { ...prev.fullAddress, city: e.target.value, postalCode: "" },
                                }))
                              }
                              aria-invalid={submitAttempted && !!errors.errs.addressCity}
                            >
                              <option value="">Select City</option>
                              {(CITIES_BY_STATE[draft.fullAddress.state] ?? []).map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </SelectInput>
                            {submitAttempted && errors.errs.addressCity ? (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.addressCity}</p>
                            ) : null}
                          </div>

                          <div>
                            {(POSTAL_CODES_BY_CITY[draft.fullAddress.city] ?? []).length ? (
                              <SelectInput
                                id={postalCodeId}
                                value={draft.fullAddress.postalCode}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    fullAddress: { ...prev.fullAddress, postalCode: e.target.value },
                                  }))
                                }
                                aria-invalid={submitAttempted && !!errors.errs.addressPostalCode}
                              >
                                <option value="">Select code</option>
                                {(POSTAL_CODES_BY_CITY[draft.fullAddress.city] ?? []).map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </SelectInput>
                            ) : (
                              <TextInput
                                id={postalCodeId}
                                placeholder="e.g. 40000"
                                value={draft.fullAddress.postalCode}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    fullAddress: { ...prev.fullAddress, postalCode: e.target.value },
                                  }))
                                }
                                aria-invalid={submitAttempted && !!errors.errs.addressPostalCode}
                              />
                            )}
                            {submitAttempted && errors.errs.addressPostalCode ? (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.errs.addressPostalCode}</p>
                            ) : null}
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error ? (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <TempleOnboardingStepActions
              className="mt-2 pt-3"
              onBack={() => router.push("/temple-admin/admin-profile")}
              primary={
                <button
                  type="submit"
                  disabled={isSaving || !core || !!loadError}
                  className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              }
            />
          </form>
        </>
      )}
    </div>
  );
}

