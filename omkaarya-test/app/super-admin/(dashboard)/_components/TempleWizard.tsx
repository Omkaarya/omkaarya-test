"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CircleDot,
  Eye,
  Flower2,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Sun,
  X,
} from "lucide-react";
import AdminButton from "@/app/components/admin/AdminButton";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import AffixedInput from "@/app/components/admin/AffixedInput";
import FormField from "@/app/components/admin/FormField";
import LogoUpload from "@/app/components/admin/LogoUpload";
import { fileToDataUrl } from "@/lib/file-to-data-url";
import PhoneFieldsGroup, {
  PhoneRowField,
  type PhoneRowValue,
} from "@/app/components/admin/PhoneFieldsGroup";
import SelectInput from "@/app/components/admin/SelectInput";
import SelectionCard from "@/app/components/admin/SelectionCard";
import TextInput from "@/app/components/admin/TextInput";
import WizardStepper, { STEP_LABELS } from "@/app/components/admin/WizardStepper";
import type { SuperAdminTempleDetail } from "@/lib/super-admin-temple-detail";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  domainFieldHint,
  normalizeCustomDomainHost,
  planHasCustomDomain,
  resolvePortalPreview,
  splitTempleDomainFromApi,
  stripOmkaaryaFromCustomDomainInput,
  templeSubdomainPayloadValue,
  type PlanFeatureRow,
} from "@/lib/temple-portal-domain";
import {
  normalizeTempleSubdomainLabel,
  templeNameToSubdomainSlug,
} from "@/lib/temple-subdomain";
import {
  type ApiPricingPlan,
  effectiveMonthlyFromYearlyCents,
  getPlanByIdFromList,
  isPricingPlanId,
} from "@/lib/temple-pricing-plans";
import LocationCityField from "@/app/components/admin/LocationCityField";
import {
  countryLabelFromCode,
  countryOptionsWithFallback,
  dialForCountryIso,
  getStateLabel,
  getStateOptions,
  optionsWithFallback,
} from "@/lib/location-data";
import { useMasterDeitiesOptions } from "@/lib/use-master-deities-options";
import DeityUpsertModal from "@/app/super-admin/(dashboard)/core/deities/DeityUpsertModal";

export type TempleWizardMode = "create" | "edit";

export type TempleWizardProps = {
  mode: TempleWizardMode;
  tenantId?: string;
  initialDetail?: SuperAdminTempleDetail | null;
  /** When `mode === "edit"`, render the same wizard read-only (no PATCH). */
  readOnly?: boolean;
};

/** Temple form country (ISO) → default dial code for phone rows when country changes */
function dialForCountry(iso: string): string {
  return dialForCountryIso(iso);
}

function emptyPhoneForCountry(iso: string): PhoneRowValue {
  return { countryCode: dialForCountry(iso), nationalNumber: "" };
}

/** API / display string for admin WhatsApp */
function formatPhoneRowForApi(p: PhoneRowValue): string {
  const n = p.nationalNumber.trim();
  if (!n) return "";
  return `${p.countryCode} ${n}`.replace(/\s+/g, " ").trim();
}

function phoneRowError(p: PhoneRowValue, label: string): string | undefined {
  const raw = p.nationalNumber.trim();
  if (!raw) return undefined; // optional unless user enters something
  const digits = raw.replace(/\D/g, "");
  if (!digits) return `Enter a valid ${label} number.`;
  if (digits.length < 8 || digits.length > 15) return `Enter a valid ${label} number.`;
  return undefined;
}

type Tradition = "Hindu" | "Jain" | "Buddhist" | "Sikh";

const TRADITIONS: {
  id: Tradition;
  title: string;
  bullets: string[];
  icon: ReactNode;
}[] = [
  {
    id: "Hindu",
    title: "Hindu",
    bullets: ["Poojas, sevas, abhishekam", "Deity-centric calendar"],
    icon: <Sun className="h-6 w-6" aria-hidden />,
  },
  {
    id: "Jain",
    title: "Jain",
    bullets: ["Tirth-focused events", "Fasting & festivals"],
    icon: <Flower2 className="h-6 w-6" aria-hidden />,
  },
  {
    id: "Buddhist",
    title: "Buddhist",
    bullets: ["Meditation & teachings", "Sangha programs"],
    icon: <CircleDot className="h-6 w-6" aria-hidden />,
  },
  {
    id: "Sikh",
    title: "Sikh",
    bullets: ["Gurdwara programs", "Langar & kirtan"],
    icon: <BookOpen className="h-6 w-6" aria-hidden />,
  },
];

function nextButtonLabel(step: number, wizardMode: TempleWizardMode, viewOnly: boolean): string {
  if (step >= STEP_LABELS.length - 1) {
    if (viewOnly) return "Continue";
    return wizardMode === "edit" ? "Save changes" : "Create temple";
  }
  const nextName = STEP_LABELS[step + 1];
  if (step === 0) return `Next: ${nextName}`;
  return `Next: ${nextName}`;
}

type AdminStepErrors = {
  fullName?: string;
  email?: string;
  whatsapp?: string;
  role?: string;
};

type Step3Errors = {
  selectedPlan?: string;
  billingCycle?: string;
};

const DEFAULT_TRIAL_DAYS = 14;

function formatTrialEndsAt(iso: string | null | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

type Step1Errors = {
  templeName?: string;
  deity?: string;
  country?: string;
  city?: string;
  address?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  fax?: string;
  establishedYear?: string;
  charityRegistrationNumber?: string;
  subdomain?: string;
};

type BillingCycle = "Monthly" | "Annually";

function matchCatalogPlanId(plans: ApiPricingPlan[], templePlanName: string, catalogPlanId?: string | null): string | null {
  const id = (catalogPlanId ?? "").trim();
  if (isPricingPlanId(id)) {
    const byId = plans.find((p) => p.id === id);
    if (byId) return byId.id;
  }
  const t = templePlanName.trim().toLowerCase();
  return plans.find((p) => p.name.trim().toLowerCase() === t)?.id ?? null;
}

function traditionFromApi(s: string): Tradition {
  const t = s.trim();
  if (t === "Hindu" || t === "Jain" || t === "Buddhist" || t === "Sikh") return t;
  return "Hindu";
}

function parseAdminWhatsappToRow(s: string, countryIso: string): PhoneRowValue {
  const t = s.trim();
  if (!t) return emptyPhoneForCountry(countryIso);
  const spaced = t.match(/^(\+\d{1,4})\s+(.+)$/);
  if (spaced) return { countryCode: spaced[1], nationalNumber: spaced[2].trim() };
  const tight = t.match(/^(\+\d{1,4})(\d[\d\s]*)$/);
  if (tight) return { countryCode: tight[1], nationalNumber: tight[2].trim() };
  return { countryCode: dialForCountry(countryIso), nationalNumber: t.replace(/\D/g, "") };
}

const TEMPLES_LIST_PATH = "/super-admin/core/temples";
const LAST_WIZARD_STEP = STEP_LABELS.length - 1;

export default function TempleWizard({ mode, tenantId, initialDetail, readOnly = false }: TempleWizardProps) {
  const router = useRouter();
  const isViewOnly = mode === "edit" && readOnly;
  const editTempleHref =
    tenantId != null && tenantId.trim() !== ""
      ? `/super-admin/edit-temple/${encodeURIComponent(tenantId.trim())}`
      : "/super-admin/core/temples";
  const [step, setStep] = useState(() => (mode === "edit" && readOnly ? LAST_WIZARD_STEP : 0));
  const validationToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef<string>("");
  const [noChangesOpen, setNoChangesOpen] = useState(false);
  const [hydrated, setHydrated] = useState(mode === "create");
  const [initialTempleLogoDataUrl, setInitialTempleLogoDataUrl] = useState<string | null>(null);

  const [tradition, setTradition] = useState<Tradition>("Hindu");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [templeName, setTempleName] = useState("");
  const [deity, setDeity] = useState("");
  const [country, setCountry] = useState("GB");
  const [regionState, setRegionState] = useState("");
  const [city, setCity] = useState("London");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [whatsapp, setWhatsapp] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [fax, setFax] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [websitePath, setWebsitePath] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const subdomainTouchedRef = useRef(false);
  const customDomainTouchedRef = useRef(false);
  const [subdomainTaken, setSubdomainTaken] = useState(false);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [planFeatureConfig, setPlanFeatureConfig] = useState<PlanFeatureRow[]>([]);
  const [planFeaturesLoading, setPlanFeaturesLoading] = useState(false);
  const planSectionRef = useRef<HTMLDivElement>(null);
  const [establishedYear, setEstablishedYear] = useState("");
  const [charityRegistered, setCharityRegistered] = useState(false);
  const [charityRegistrationNumber, setCharityRegistrationNumber] = useState("");
  const [adminProfileFile, setAdminProfileFile] = useState<File | null>(null);
  const [deityModalOpen, setDeityModalOpen] = useState(false);

  const { optionsWithFallback: deityOptionsFor, reload: reloadDeities } = useMasterDeitiesOptions();
  const countryOptions = useMemo(() => countryOptionsWithFallback(country), [country]);
  const deityOptions = useMemo(() => deityOptionsFor(deity), [deity, deityOptionsFor]);
  const deityLabel = useMemo(
    () => deityOptions.find((o) => o.value === deity)?.label ?? deity,
    [deity, deityOptions]
  );
  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminWhatsapp, setAdminWhatsapp] = useState<PhoneRowValue>(() =>
    emptyPhoneForCountry("GB")
  );
  const [adminRole, setAdminRole] = useState("Temple Admin");
  const [adminTouched, setAdminTouched] = useState({
    fullName: false,
    email: false,
    whatsapp: false,
    role: false,
  });
  const [catalogPlans, setCatalogPlans] = useState<ApiPricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle | "">("Annually");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [extendTrialDays, setExtendTrialDays] = useState("7");
  const [extendTrialBusy, setExtendTrialBusy] = useState(false);
  const [extendTrialMessage, setExtendTrialMessage] = useState<string | null>(null);
  const [step3Touched, setStep3Touched] = useState({
    selectedPlan: false,
    billingCycle: false,
  });
  const [step1ShowErrors, setStep1ShowErrors] = useState(false);
  const [validationToastOpen, setValidationToastOpen] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const didInitPlanIdRef = useRef(false);

  const computeSnapshot = useCallback(() => {
    return JSON.stringify({
      tradition,
      templeName,
      deity,
      country,
      regionState,
      city,
      address,
      email,
      telephone,
      whatsapp,
      fax,
      websitePath,
      subdomain,
      customDomain,
      establishedYear,
      charityRegistered,
      charityRegistrationNumber,
      adminFullName,
      adminEmail,
      adminWhatsapp,
      adminRole,
      selectedPlanId,
      billingCycle,
      trialEndsAt,
      logoFileName: logoFile?.name ?? "",
      adminProfileFileName: adminProfileFile?.name ?? "",
    });
  }, [
    tradition,
    templeName,
    deity,
    country,
    regionState,
    city,
    address,
    email,
    telephone,
    whatsapp,
    fax,
    websitePath,
    subdomain,
    customDomain,
    establishedYear,
    charityRegistered,
    charityRegistrationNumber,
    adminFullName,
    adminEmail,
    adminWhatsapp,
    adminRole,
    selectedPlanId,
    billingCycle,
    trialEndsAt,
    logoFile,
    adminProfileFile,
  ]);

  useEffect(() => {
    if (mode !== "edit" || !initialDetail) return;
    const d = initialDetail;
    setTradition(traditionFromApi(d.temple.tradition));
    setTempleName(d.temple.name);
    setDeity(d.temple.deity);
    setCountry(d.temple.country);
    setCity(d.temple.city);
    setAddress(d.temple.address);
    setEmail(d.temple.email);
    setTelephone(
      d.temple.phone && (d.temple.phone.countryCode || d.temple.phone.nationalNumber)
        ? { ...d.temple.phone }
        : emptyPhoneForCountry(d.temple.country)
    );
    setWhatsapp(
      d.temple.whatsapp && (d.temple.whatsapp.countryCode || d.temple.whatsapp.nationalNumber)
        ? { ...d.temple.whatsapp }
        : emptyPhoneForCountry(d.temple.country)
    );
    setFax(
      d.temple.fax && (d.temple.fax.countryCode || d.temple.fax.nationalNumber)
        ? { ...d.temple.fax }
        : emptyPhoneForCountry(d.temple.country)
    );
    setWebsitePath(d.temple.website);
    const { slug, customDomain: customFromApi } = splitTempleDomainFromApi(d.temple.subdomain);
    setSubdomain(slug);
    setCustomDomain(customFromApi);
    subdomainTouchedRef.current = true;
    customDomainTouchedRef.current = Boolean(customFromApi);
    setEstablishedYear(d.temple.establishedYear);
    setCharityRegistered(d.temple.charityRegistered === true);
    setCharityRegistrationNumber((d.temple.charityRegistrationNumber ?? "").trim());
    setAdminFullName(d.admin.fullName);
    setAdminEmail(d.admin.email);
    setAdminWhatsapp(parseAdminWhatsappToRow(d.admin.whatsapp, d.temple.country));
    setAdminRole(d.admin.role);
    const bc = d.planBilling.billingCycle;
    setBillingCycle(bc === "Monthly" || bc === "Annually" ? bc : "Annually");
    setTrialEndsAt(d.planBilling.trial.endsAt ?? null);
    setInitialTempleLogoDataUrl(d.logoTempleDataUrl);
    setHydrated(true);
  }, [mode, initialDetail]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/pricing-plans", { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as { success?: boolean; data?: ApiPricingPlan[] };
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCatalogPlans(json.data);
        }
      } catch {
        /* step 3 shows empty */
      }
    })();
  }, []);

  useEffect(() => {
    didInitPlanIdRef.current = false;
  }, [mode, tenantId, initialDetail?.planBilling?.selectedPlan, initialDetail?.planBilling?.selectedPricingPlanId]);

  useEffect(() => {
    if (catalogPlans.length === 0) return;
    if (mode === "create" && !selectedPlanId) {
      const def = catalogPlans.find((p) => p.popular)?.id ?? catalogPlans[0]!.id;
      setSelectedPlanId(def);
      return;
    }
    if (mode === "edit" && initialDetail && !didInitPlanIdRef.current) {
      const id = matchCatalogPlanId(
        catalogPlans,
        initialDetail.planBilling.selectedPlan,
        initialDetail.planBilling.selectedPricingPlanId
      );
      if (id) {
        setSelectedPlanId(id);
        didInitPlanIdRef.current = true;
      }
    }
  }, [catalogPlans, mode, initialDetail, selectedPlanId]);

  useEffect(() => {
    if (!selectedPlanId) {
      setPlanFeatureConfig([]);
      return;
    }
    let cancel = false;
    (async () => {
      setPlanFeaturesLoading(true);
      try {
        const res = await fetch(
          `/api/plan-features?planId=${encodeURIComponent(selectedPlanId)}`,
          { cache: "no-store" }
        );
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          data?: Array<{ featureKey?: string; isEnabled?: boolean }>;
        } | null;
        if (cancel) return;
        if (res.ok && json?.success && Array.isArray(json.data)) {
          setPlanFeatureConfig(
            json.data.map((row) => ({
              featureKey: String(row.featureKey ?? ""),
              isEnabled: row.isEnabled === true,
            }))
          );
        } else {
          setPlanFeatureConfig([]);
        }
      } catch {
        if (!cancel) setPlanFeatureConfig([]);
      } finally {
        if (!cancel) setPlanFeaturesLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [selectedPlanId]);

  const selectedPlanDataForDomain = getPlanByIdFromList(catalogPlans, selectedPlanId ?? undefined);
  const allowCustomDomain = planHasCustomDomain(
    planFeatureConfig,
    selectedPlanDataForDomain?.features
  );

  useEffect(() => {
    if (!allowCustomDomain) {
      setCustomDomain("");
      customDomainTouchedRef.current = false;
    } else {
      setCustomDomain((prev) => stripOmkaaryaFromCustomDomainInput(prev));
    }
  }, [allowCustomDomain]);

  useLayoutEffect(() => {
    if (mode === "create") {
      snapshotRef.current = computeSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- single baseline; omit computeSnapshot deps
  }, [mode]);

  useLayoutEffect(() => {
    if (mode === "edit" && hydrated) {
      snapshotRef.current = computeSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseline after hydrate only
  }, [mode, hydrated]);

  useLayoutEffect(() => {
    if (isViewOnly && mode === "edit" && hydrated) {
      snapshotRef.current = computeSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewOnly, mode, hydrated]);

  useEffect(() => {
    if (isViewOnly && hydrated) {
      setStep(LAST_WIZARD_STEP);
    }
  }, [isViewOnly, hydrated]);

  const stateOptions = useMemo(
    () => optionsWithFallback(getStateOptions(country), regionState),
    [country, regionState]
  );

  const formatAddressForSave = useCallback(
    (street: string) => {
      const stateName = regionState ? getStateLabel(country, regionState) : "";
      const line = street.trim();
      if (stateName && line) return `${line}, ${stateName}`;
      if (stateName && !line) return stateName;
      return line;
    },
    [country, regionState]
  );

  const handleCountryChange = (next: string) => {
    setCountry(next);
    setRegionState("");
    setCity("");
    const dial = dialForCountry(next);
    setTelephone((prev) => ({ ...prev, countryCode: dial }));
    setWhatsapp((prev) => ({ ...prev, countryCode: dial }));
    setFax((prev) => ({ ...prev, countryCode: dial }));
    setAdminWhatsapp((prev) => ({ ...prev, countryCode: dial }));
  };

  const handlePhoneChange = (
    which: "telephone" | "whatsapp" | "fax",
    next: PhoneRowValue
  ) => {
    if (which === "telephone") setTelephone(next);
    if (which === "whatsapp") setWhatsapp(next);
    if (which === "fax") setFax(next);
  };

  const slugPreview = normalizeTempleSubdomainLabel(subdomain) || "temple_name";

  const portalPreviewHost = useMemo(
    () =>
      resolvePortalPreview({
        allowCustomDomain,
        slug: subdomain,
        customDomain,
      }),
    [allowCustomDomain, subdomain, customDomain]
  );

  const templeDomainPayload = useMemo(
    () =>
      templeSubdomainPayloadValue({
        allowCustomDomain,
        slug: subdomain,
        customDomain,
      }),
    [allowCustomDomain, subdomain, customDomain]
  );

  useEffect(() => {
    if (isViewOnly) {
      setSubdomainTaken(false);
      setSubdomainChecking(false);
      return;
    }

    if (allowCustomDomain) {
      const host = normalizeCustomDomainHost(customDomain);
      if (!host) {
        setSubdomainTaken(false);
        setSubdomainChecking(false);
        return;
      }
    } else {
      const label = normalizeTempleSubdomainLabel(subdomain);
      if (!label) {
        setSubdomainTaken(false);
        setSubdomainChecking(false);
        return;
      }
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSubdomainChecking(true);
      try {
        const params = new URLSearchParams();
        if (mode === "edit" && tenantId?.trim()) {
          params.set("excludeTenantId", tenantId.trim());
        }
        if (allowCustomDomain) {
          params.set("host", normalizeCustomDomainHost(customDomain));
        } else {
          params.set("subdomain", normalizeTempleSubdomainLabel(subdomain));
        }
        const res = await fetch(`/api/temples/check-subdomain?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          data?: { available?: boolean };
        } | null;
        if (controller.signal.aborted) return;
        const available = json?.success === true && json.data?.available === true;
        setSubdomainTaken(!available);
      } catch {
        if (!controller.signal.aborted) setSubdomainTaken(false);
      } finally {
        if (!controller.signal.aborted) setSubdomainChecking(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [subdomain, customDomain, allowCustomDomain, mode, tenantId, isViewOnly]);

  const handleUpgradeForCustomDomain = () => {
    setStep(2);
    setStep3Touched((prev) => ({ ...prev, selectedPlan: true }));
    window.setTimeout(() => {
      planSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleTempleNameChange = (value: string) => {
    setTempleName(value);
    if (!subdomainTouchedRef.current) {
      setSubdomain(templeNameToSubdomainSlug(value));
    }
  };

  const handleSubdomainChange = (value: string) => {
    subdomainTouchedRef.current = true;
    setSubdomain(normalizeTempleSubdomainLabel(value));
  };

  const getAdminErrors = (): AdminStepErrors => {
    const errors: AdminStepErrors = {};
    if (!adminFullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (!adminEmail.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      errors.email = "Enter a valid email address.";
    }
    const digits = adminWhatsapp.nationalNumber.replace(/\D/g, "");
    if (!digits) {
      errors.whatsapp = "WhatsApp number is required.";
    } else if (digits.length < 8 || digits.length > 15) {
      errors.whatsapp = "Enter a valid WhatsApp number.";
    }
    if (!adminRole.trim()) {
      errors.role = "Role/Title is required.";
    }
    return errors;
  };

  const adminErrors = getAdminErrors();
  const isStep2Valid = Object.keys(adminErrors).length === 0;

  const getStep1Errors = (): Step1Errors => {
    const errors: Step1Errors = {};
    if (!templeName.trim()) errors.templeName = "Temple name is required.";
    if (!deity.trim()) errors.deity = "Primary deity is required.";
    if (!country.trim()) errors.country = "Country is required.";
    if (!city.trim()) errors.city = "City is required.";
    if (!address.trim()) errors.address = "Address is required.";
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Temple email format is invalid.";
    }

    const telErr = phoneRowError(telephone, "Telephone");
    if (telErr) errors.telephone = telErr;
    const waErr = phoneRowError(whatsapp, "WhatsApp");
    if (waErr) errors.whatsapp = waErr;
    const faxErr = phoneRowError(fax, "Fax");
    if (faxErr) errors.fax = faxErr;

    const year = Number(establishedYear);
    if (!establishedYear.trim()) {
      errors.establishedYear = "Established year is required.";
    } else if (!Number.isInteger(year) || year < 1800 || year > 2100) {
      errors.establishedYear = "Established year must be between 1800 and 2100.";
    }
    if (charityRegistered && !charityRegistrationNumber.trim()) {
      errors.charityRegistrationNumber = "Charity registration number is required when registered.";
    }
    if (allowCustomDomain) {
      const host = normalizeCustomDomainHost(customDomain);
      if (!host) {
        errors.subdomain = "Enter a valid custom domain (e.g. bookings.mytemple.org).";
      } else if (subdomainTaken) {
        errors.subdomain = `“${host}” is already used by another temple.`;
      }
    } else {
      const subdomainLabel = normalizeTempleSubdomainLabel(subdomain);
      if (!subdomainLabel) {
        errors.subdomain = "Subdomain is required.";
      } else if (subdomainTaken) {
        errors.subdomain = `“${subdomainLabel}.omkaarya.com” is already used by another temple.`;
      }
    }
    return errors;
  };
  const step1Errors = getStep1Errors();
  const isStep1Valid = Object.keys(step1Errors).length === 0;

  const getStep3Errors = (): Step3Errors => {
    const errors: Step3Errors = {};
    if (!selectedPlanId) {
      errors.selectedPlan = "Please select a plan.";
    }
    if (!billingCycle) {
      errors.billingCycle = "Please select a billing cycle.";
    }
    return errors;
  };

  const step3Errors = getStep3Errors();
  const isStep3Valid = Object.keys(step3Errors).length === 0;

  const selectedPlanData = getPlanByIdFromList(catalogPlans, selectedPlanId ?? undefined);
  const selectedPlanName =
    selectedPlanData?.name ?? initialDetail?.planBilling?.selectedPlan?.trim() ?? "";

  const getDisplayPriceDollars = (plan: ApiPricingPlan | undefined): number => {
    if (!plan) return 0;
    if (billingCycle === "Annually") {
      return effectiveMonthlyFromYearlyCents(plan.priceYearly) / 100;
    }
    return plan.priceMonthly / 100;
  };

  const selectedPlanForReview = selectedPlanName;
  const priceLine = `$${getDisplayPriceDollars(selectedPlanData).toFixed(0)}/mth, ${
    billingCycle === "Annually" ? "billed annually" : "billed monthly"
  }`;
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + (billingCycle === "Annually" ? 12 : 1));
  const renewalDateLabel = renewalDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const annualAmount = getDisplayPriceDollars(selectedPlanData) * 12;
  const billingAmountLabel =
    billingCycle === "Annually" ? `£${annualAmount.toFixed(2)}/Annually` : `£${getDisplayPriceDollars(selectedPlanData).toFixed(2)}/Monthly`;
  const canSubmitAllSteps = isStep1Valid && isStep2Valid && isStep3Valid;

  const invitePayload = {
    admin: {
      fullName: adminFullName.trim(),
      email: adminEmail.trim(),
      whatsapp: formatPhoneRowForApi(adminWhatsapp),
      role: adminRole,
      profileImageFile: adminProfileFile,
    },
    planBilling: {
      selectedPlan: selectedPlanName,
      billingCycle,
      trial: {
        enabled: true,
        days: DEFAULT_TRIAL_DAYS,
        endsAt: trialEndsAt,
      },
    },
  };

  const isDirty = useMemo(() => {
    if (isViewOnly) return false;
    if (mode === "edit" && !hydrated) return false;
    return computeSnapshot() !== snapshotRef.current;
  }, [isViewOnly, mode, hydrated, computeSnapshot]);

  const postSave = usePostSaveSuccess({ router });
  const formGuard = useUnsavedFormGuard({
    isDirty,
    enabled: !isViewOnly && !(mode === "edit" && !hydrated) && !postSave.isLocked,
  });

  /** Jump back freely; jump forward only when earlier wizard sections are valid (filled). */
  const isStepReachable = (target: number): boolean => {
    if (target < 0 || target >= STEP_LABELS.length) return false;
    if (isViewOnly) return true;
    if (target <= step) return true;
    if (target >= 1 && !isStep1Valid) return false;
    if (target >= 2 && !isStep2Valid) return false;
    if (target >= 3 && !isStep3Valid) return false;
    return true;
  };

  const dismissValidationToast = useCallback(() => {
    if (validationToastTimerRef.current) {
      clearTimeout(validationToastTimerRef.current);
      validationToastTimerRef.current = null;
    }
    setValidationToastOpen(false);
  }, []);

  const showRequiredFieldsToast = useCallback(() => {
    if (validationToastTimerRef.current) {
      clearTimeout(validationToastTimerRef.current);
    }
    setValidationToastOpen(true);
    validationToastTimerRef.current = setTimeout(() => {
      setValidationToastOpen(false);
      validationToastTimerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (validationToastTimerRef.current) {
        clearTimeout(validationToastTimerRef.current);
      }
    };
  }, []);

  const handleWizardStepClick = (target: number) => {
    if (isStepReachable(target)) {
      setStep(target);
      return;
    }
    if (target <= step) return;
    showRequiredFieldsToast();
    if (!isStep1Valid) {
      setStep1ShowErrors(true);
      setStep(0);
      return;
    }
    if (!isStep2Valid) {
      setAdminTouched({
        fullName: true,
        email: true,
        whatsapp: true,
        role: true,
      });
      setStep(1);
      return;
    }
    if (!isStep3Valid) {
      setStep3Touched({
        selectedPlan: true,
        billingCycle: true,
      });
      setStep(2);
    }
  };

  const requestExit = () => {
    if (isViewOnly) {
      router.push(TEMPLES_LIST_PATH);
      return;
    }
    if (mode === "edit" && !hydrated) {
      router.push(TEMPLES_LIST_PATH);
      return;
    }
    formGuard.requestNavigate(TEMPLES_LIST_PATH);
  };

  const onPostSaveSuccess = (successMessage: string) => {
    snapshotRef.current = computeSnapshot();
    formGuard.markClean();
    postSave.triggerSuccess({
      message: successMessage,
      redirectTo: TEMPLES_LIST_PATH,
    });
  };

  const handleCreateTemple = async () => {
    if (!canSubmitAllSteps) {
      setSubmitError("Please complete all required information before creating the temple.");
      return;
    }
    if (subdomainTaken || subdomainChecking) {
      setSubmitError(
        subdomainChecking
          ? "Please wait while we verify the subdomain."
          : "This subdomain is already in use. Choose a different portal domain."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload: {
      temple: {
        tradition: string;
        name: string;
        deity: string;
        country: string;
        city: string;
        address: string;
        email: string;
        phone: PhoneRowValue;
        whatsapp: PhoneRowValue;
        fax: PhoneRowValue;
        website: string;
        subdomain: string;
        establishedYear: string;
        charityRegistered: boolean;
        charityRegistrationNumber: string;
      };
      admin: {
        fullName: string;
        email: string;
        whatsapp: string;
        role: string;
      };
      planBilling: {
        selectedPlan: string;
        selectedPricingPlanId: string | null;
        billingCycle: BillingCycle | "";
        trial: { enabled: boolean; days: number | null };
      };
      logoTempleDataUrl?: string;
      adminProfileDataUrl?: string;
    } = {
      temple: {
        tradition,
        name: templeName.trim(),
        deity: deity.trim(),
        country,
        city,
        address: formatAddressForSave(address),
        email: email.trim(),
        phone: telephone,
        whatsapp,
        fax,
        website: websitePath.trim(),
        subdomain: templeDomainPayload || slugPreview,
        establishedYear: establishedYear.trim(),
        charityRegistered,
        charityRegistrationNumber: charityRegistrationNumber.trim(),
      },
      admin: {
        fullName: adminFullName.trim(),
        email: adminEmail.trim(),
        whatsapp: formatPhoneRowForApi(adminWhatsapp),
        role: adminRole,
      },
      planBilling: {
        selectedPlan: selectedPlanName,
        selectedPricingPlanId: isPricingPlanId(selectedPlanId) ? selectedPlanId : null,
        billingCycle,
        trial: {
          enabled: true,
          days: DEFAULT_TRIAL_DAYS,
          endsAt: trialEndsAt,
        },
      },
    };

    if (logoFile) {
      try {
        payload.logoTempleDataUrl = await fileToDataUrl(logoFile);
      } catch {
        setSubmitError("Could not read the temple logo image.");
        setIsSubmitting(false);
        return;
      }
    }
    if (adminProfileFile) {
      try {
        payload.adminProfileDataUrl = await fileToDataUrl(adminProfileFile);
      } catch {
        setSubmitError("Could not read the admin profile image.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/temples/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as
        | {
            success: true;
            data: {
              temporaryPassword?: string;
              inviteEmailSent?: boolean;
              operationalDbName?: string;
            };
          }
        | {
            success?: boolean;
            data?: {
              temporaryPassword?: string;
              inviteEmailSent?: boolean;
              operationalDbName?: string;
            };
            temporaryPassword?: string;
            inviteEmailSent?: boolean;
            operationalDbName?: string;
            error?: unknown;
          }
        | null;
      if (!response.ok) {
        throw new Error(jsonApiErrorMessage(data) || "Failed to create temple.");
      }
      const inner =
        data && typeof data === "object" && "data" in data && data && (data as { data?: unknown }).data
          ? (data as {
              data: { temporaryPassword?: string; inviteEmailSent?: boolean; operationalDbName?: string };
            }).data
          : (data as {
              temporaryPassword?: string;
              inviteEmailSent?: boolean;
              operationalDbName?: string;
            } | null);
      const tempPwd =
        inner && typeof inner.temporaryPassword === "string" ? inner.temporaryPassword : "";
      const inviteEmailSent =
        inner && "inviteEmailSent" in inner && typeof inner.inviteEmailSent === "boolean"
          ? inner.inviteEmailSent
          : undefined;
      const operationalDbName =
        inner && typeof inner.operationalDbName === "string" && inner.operationalDbName.trim() !== ""
          ? inner.operationalDbName.trim()
          : null;
      const opsNote = operationalDbName
        ? ` Operational PostgreSQL database: ${operationalDbName}.`
        : "";
      const successMessage =
        inviteEmailSent === true
          ? `Temple successfully created.${opsNote} An invite email has been sent to the admin.`
          : inviteEmailSent === false
            ? `Temple successfully created.${opsNote} Invite email could not be sent (email not configured or SMTP failed).`
            : `Temple successfully created.${opsNote}`;
      setSubmitSuccess(successMessage);
      onPostSaveSuccess(successMessage);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create temple.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemple = async () => {
    if (isViewOnly) return;
    if (!canSubmitAllSteps || mode !== "edit" || !tenantId?.trim()) {
      setSubmitError("Please complete all required information before saving.");
      return;
    }
    if (subdomainTaken || subdomainChecking) {
      setSubmitError(
        subdomainChecking
          ? "Please wait while we verify the subdomain."
          : "This subdomain is already in use. Choose a different portal domain."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const body: Record<string, unknown> = {
      temple: {
        tradition,
        name: templeName.trim(),
        deity: deity.trim(),
        country,
        city,
        address: formatAddressForSave(address),
        email: email.trim(),
        phone: telephone,
        whatsapp,
        fax,
        website: websitePath.trim(),
        subdomain: templeDomainPayload || slugPreview,
        establishedYear: establishedYear.trim(),
        charityRegistered,
        charityRegistrationNumber: charityRegistrationNumber.trim(),
      },
      admin: {
        fullName: adminFullName.trim(),
        whatsapp: formatPhoneRowForApi(adminWhatsapp),
        role: adminRole,
      },
      planBilling: {
        selectedPlan: selectedPlanName,
        selectedPricingPlanId: isPricingPlanId(selectedPlanId) ? selectedPlanId : null,
        billingCycle,
        trial: {
          enabled: true,
          days: DEFAULT_TRIAL_DAYS,
          endsAt: trialEndsAt,
        },
      },
    };

    if (logoFile) {
      try {
        body.logoTempleDataUrl = await fileToDataUrl(logoFile);
      } catch {
        setSubmitError("Could not read the logo image.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/temples/${encodeURIComponent(tenantId.trim())}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as
        | { success: true; message: string; data?: unknown }
        | { success?: boolean; message?: string; error?: unknown }
        | null;
      if (!response.ok) {
        throw new Error(jsonApiErrorMessage(data) || "Failed to update temple.");
      }
      const successMessage =
        data && typeof data === "object" && "message" in data && typeof (data as { message: string }).message === "string"
          ? (data as { message: string }).message
          : "Temple updated successfully.";
      setSubmitSuccess(successMessage);
      setInitialTempleLogoDataUrl(
        typeof body.logoTempleDataUrl === "string" ? body.logoTempleDataUrl : initialTempleLogoDataUrl
      );
      setLogoFile(null);
      onPostSaveSuccess(successMessage);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update temple.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (isViewOnly) return;
    if (!canSubmitAllSteps) {
      showRequiredFieldsToast();
      setStep1ShowErrors(true);
      setAdminTouched({
        fullName: true,
        email: true,
        whatsapp: true,
        role: true,
      });
      setStep3Touched({
        selectedPlan: true,
        billingCycle: true,
      });
      if (!isStep1Valid) setStep(0);
      else if (!isStep2Valid) setStep(1);
      else if (!isStep3Valid) setStep(2);
      return;
    }
    if (!isDirty) {
      setNoChangesOpen(true);
      window.setTimeout(() => {
        setNoChangesOpen(false);
      }, 2200);
      return;
    }
    if (mode === "create") {
      await handleCreateTemple();
    } else {
      await handleUpdateTemple();
    }
  };

  const onNext = () => {
    if (!isViewOnly) {
      if (step === 0 && !isStep1Valid) {
        setStep1ShowErrors(true);
        showRequiredFieldsToast();
        return;
      }
      if (step === 1 && !isStep2Valid) {
        setAdminTouched({
          fullName: true,
          email: true,
          whatsapp: true,
          role: true,
        });
        showRequiredFieldsToast();
        return;
      }
      if (step === 2 && !isStep3Valid) {
        setStep3Touched({
          selectedPlan: true,
          billingCycle: true,
        });
        showRequiredFieldsToast();
        return;
      }
    }
    if (step >= STEP_LABELS.length - 1 && !isViewOnly) {
      void handleFinalSubmit();
      return;
    }
    if (step >= STEP_LABELS.length - 1 && isViewOnly) {
      return;
    }
    setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
  };

  if (mode === "edit" && !hydrated) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 py-24 text-zinc-600 dark:text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" aria-hidden />
        <p className="text-sm">Loading temple…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {isViewOnly ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-700 dark:text-zinc-200">View only — fields cannot be changed here.</p>
          <Link
            href={editTempleHref}
            className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
          >
            Edit temple
          </Link>
        </div>
      ) : null}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        {!isViewOnly ? (
          <WizardStepper
            currentStep={step}
            onStepClick={handleWizardStepClick}
            isStepReachable={isStepReachable}
          />
        ) : null}

        <div className={isViewOnly ? "mt-0" : "mt-10"}>
          {step === 0 && (
            <>
              <div className="mb-8 flex gap-3 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/40">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Temple Details
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Temple tradition determines which poojas and deities are pre-loaded for the
                    admin.
                  </p>
                </div>
              </div>

              <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Temple Tradition
              </p>
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TRADITIONS.map((t) => (
                  <SelectionCard
                    key={t.id}
                    title={t.title}
                    bullets={t.bullets}
                    icon={t.icon}
                    selected={tradition === t.id}
                    disabled={isViewOnly || t.id !== "Hindu"}
                    onClick={() => setTradition(t.id)}
                  />
                ))}
              </div>

              <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Logo</p>
              <div className="mb-8">
                <LogoUpload
                  file={logoFile}
                  onFileChange={setLogoFile}
                  initialDataUrl={initialTempleLogoDataUrl}
                  disabled={isViewOnly}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField id="temple-name" label="Temple Name" required>
                  <div>
                    <TextInput
                      id="temple-name"
                      value={templeName}
                      onChange={(e) => handleTempleNameChange(e.target.value)}
                      placeholder="e.g. Shiva Mandir London"
                      disabled={isViewOnly}
                    />
                    {step1ShowErrors && step1Errors.templeName ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.templeName}</p>
                    ) : null}
                  </div>
                </FormField>

                <FormField
                  id="deity"
                  label="Primary Deity"
                  required
                  topRight={
                    <button
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => setDeityModalOpen(true)}
                      className="text-sm font-medium text-[var(--brand-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      + Add New
                    </button>
                  }
                >
                  <div>
                    <SelectInput
                      id="deity"
                      value={deity}
                      onChange={(e) => setDeity(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="">Select deity</option>
                      {deityOptions.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </SelectInput>
                    {step1ShowErrors && step1Errors.deity ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.deity}</p>
                    ) : null}
                  </div>
                </FormField>

                <FormField id="country" label="Country" required>
                  <div>
                    <SelectInput
                      id="country"
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="">Select country</option>
                      {countryOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </SelectInput>
                    {step1ShowErrors && step1Errors.country ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.country}</p>
                    ) : null}
                  </div>
                </FormField>

                {stateOptions.length > 0 ? (
                  <FormField id="region-state" label="State / Province">
                    <SelectInput
                      id="region-state"
                      value={regionState}
                      onChange={(e) => {
                        setRegionState(e.target.value);
                        setCity("");
                      }}
                      disabled={isViewOnly}
                    >
                      <option value="">Select state / province</option>
                      {stateOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                ) : null}

                <FormField id="city" label="City" required>
                  <div>
                    <LocationCityField
                      id="city"
                      countryIso={country}
                      stateIso={regionState}
                      value={city}
                      onChange={setCity}
                      disabled={isViewOnly}
                    />
                    {step1ShowErrors && step1Errors.city ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.city}</p>
                    ) : null}
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <FormField id="address" label="Full Address" required>
                    <div>
                      <TextInput
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, area, postal code"
                        startIcon={<MapPin className="h-4 w-4" aria-hidden />}
                        disabled={isViewOnly}
                      />
                      {step1ShowErrors && step1Errors.address ? (
                        <p className="mt-1 text-xs text-red-500">{step1Errors.address}</p>
                      ) : null}
                    </div>
                  </FormField>
                </div>

                <FormField id="email" label="Email Address" required>
                  <div>
                    <TextInput
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="temple@example.com"
                      startIcon={<Mail className="h-4 w-4" aria-hidden />}
                      disabled={isViewOnly}
                    />
                    {step1ShowErrors && step1Errors.email ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.email}</p>
                    ) : null}
                  </div>
                </FormField>

                <PhoneFieldsGroup
                  embedded
                  telephone={telephone}
                  whatsapp={whatsapp}
                  fax={fax}
                  onChange={handlePhoneChange}
                  disabled={isViewOnly}
                  errors={
                    step1ShowErrors
                      ? {
                          telephone: step1Errors.telephone,
                          whatsapp: step1Errors.whatsapp,
                          fax: step1Errors.fax,
                        }
                      : undefined
                  }
                />

                <FormField id="website" label="Website">
                  <AffixedInput
                    id="website"
                    prefix="http://"
                    value={websitePath}
                    onChange={(e) => setWebsitePath(e.target.value)}
                    placeholder="www.yourtemple.org"
                    disabled={isViewOnly}
                  />
                </FormField>

                <FormField
                  id="subdomain"
                  label={
                    planFeaturesLoading && selectedPlanId
                      ? "Domain"
                      : allowCustomDomain
                        ? "Custom domain"
                        : "Account URL"
                  }
                  hint={
                    planFeaturesLoading && selectedPlanId
                      ? "Checking plan features…"
                      : domainFieldHint({ allowCustomDomain, slug: subdomain, customDomain })
                  }
                >
                  <div>
                    {planFeaturesLoading && selectedPlanId ? (
                      <TextInput
                        id="subdomain"
                        value=""
                        readOnly
                        placeholder="Loading plan features…"
                        disabled
                        className="text-sm"
                      />
                    ) : allowCustomDomain ? (
                      <TextInput
                        key="custom-domain-input"
                        id="subdomain"
                        value={customDomain}
                        onChange={(e) => {
                          customDomainTouchedRef.current = true;
                          setCustomDomain(stripOmkaaryaFromCustomDomainInput(e.target.value));
                        }}
                        placeholder="bookings.mytemple.org"
                        disabled={isViewOnly}
                        className="text-sm"
                      />
                    ) : (
                      <>
                        <AffixedInput
                          key="omkaarya-subdomain-input"
                          id="subdomain"
                          suffix=".omkaarya.com"
                          suffixAction={
                            <button
                              type="button"
                              disabled={isViewOnly}
                              onClick={handleUpgradeForCustomDomain}
                              className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                            >
                              Upgrade
                            </button>
                          }
                          value={subdomain}
                          onChange={(e) => handleSubdomainChange(e.target.value)}
                          placeholder="your-temple"
                          disabled={isViewOnly}
                        />
                        <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          Select a plan with Custom domain to use your own hostname.{" "}
                          <button
                            type="button"
                            disabled={isViewOnly}
                            onClick={handleUpgradeForCustomDomain}
                            className="font-semibold text-[var(--brand-primary)] hover:underline disabled:opacity-50"
                          >
                            Upgrade plan
                          </button>
                        </p>
                      </>
                    )}
                    {subdomainChecking ? (
                      <p className="mt-1 text-xs text-zinc-500">Checking availability…</p>
                    ) : null}
                    {step1ShowErrors && step1Errors.subdomain ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.subdomain}</p>
                    ) : null}
                    {!step1ShowErrors && subdomainTaken ? (
                      <p className="mt-1 text-xs text-red-500">
                        This domain is already in use. Choose another hostname.
                      </p>
                    ) : null}
                  </div>
                </FormField>

                <FormField id="year" label="Established Year" required>
                  <div>
                    <TextInput
                      id="year"
                      type="number"
                      min={1800}
                      max={2100}
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      placeholder="e.g. 1998"
                      disabled={isViewOnly}
                    />
                    {step1ShowErrors && step1Errors.establishedYear ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.establishedYear}</p>
                    ) : null}
                  </div>
                </FormField>

                {/* <div className="md:col-span-2">
                  <label
                    className={`flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40 ${isViewOnly ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      checked={charityRegistered}
                      disabled={isViewOnly}
                      onChange={(e) => {
                        setCharityRegistered(e.target.checked);
                        if (!e.target.checked) setCharityRegistrationNumber("");
                      }}
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-200">
                      This temple is registered as a charity (optional; can be completed later by the temple admin).
                    </span>
                  </label>
                  {charityRegistered ? (
                    <div className="mt-3">
                      <FormField id="charity-reg-no" label="Charity registration number" required>
                        <div>
                          <TextInput
                            id="charity-reg-no"
                            value={charityRegistrationNumber}
                            onChange={(e) => setCharityRegistrationNumber(e.target.value)}
                            placeholder="Official registration number"
                            disabled={isViewOnly}
                          />
                          {step1ShowErrors && step1Errors.charityRegistrationNumber ? (
                            <p className="mt-1 text-xs text-red-500">{step1Errors.charityRegistrationNumber}</p>
                          ) : null}
                        </div>
                      </FormField>
                    </div>
                  ) : null}
                </div> */}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="mb-8 flex gap-3 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/40">
                  <KeyRound className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Temple admin account
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mode === "edit"
                      ? "This person manages the temple in Omkaarya. Admin email cannot be changed here."
                      : "This person manages the temple in Omkaarya. An invite email is sent automatically after creation."}
                  </p>
                </div>
              </div>

              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Your Profile image
              </p>
              <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                This will be display on your profile.
              </p>
              <div className="mb-8">
                <LogoUpload
                  file={adminProfileFile}
                  onFileChange={setAdminProfileFile}
                  placeholderLabel="Profile"
                  previewFit="cover"
                  disabled={isViewOnly}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField id="admin-full-name" label="Full Name" required>
                  <div>
                    <TextInput
                      id="admin-full-name"
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      onBlur={() =>
                        setAdminTouched((prev) => ({ ...prev, fullName: true }))
                      }
                      placeholder="e.g. Rajin Pillai"
                      disabled={isViewOnly}
                    />
                    {adminTouched.fullName && adminErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{adminErrors.fullName}</p>
                    )}
                  </div>
                </FormField>

                <FormField id="admin-email" label="Email Address" required>
                  <div>
                    <TextInput
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      onBlur={() => setAdminTouched((prev) => ({ ...prev, email: true }))}
                      placeholder="user@example.com"
                      startIcon={<Mail className="h-4 w-4" aria-hidden />}
                      disabled={mode === "edit" || isViewOnly}
                      readOnly={mode === "edit" || isViewOnly}
                    />
                    {adminTouched.email && adminErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{adminErrors.email}</p>
                    )}
                  </div>
                </FormField>

                <PhoneRowField
                  idPrefix="admin-wa"
                  label="WhatsApp"
                  required
                  value={adminWhatsapp}
                  onChange={setAdminWhatsapp}
                  onBlur={() => setAdminTouched((prev) => ({ ...prev, whatsapp: true }))}
                  error={adminTouched.whatsapp ? adminErrors.whatsapp : undefined}
                  disabled={isViewOnly}
                />

                <FormField
                  id="admin-role"
                  label="Role / Title"
                  required
                  topRight={
                    <button
                      type="button"
                      disabled={isViewOnly}
                      className="text-sm font-medium text-[var(--brand-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      + Add New
                    </button>
                  }
                >
                  <div>
                    <SelectInput
                      id="admin-role"
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                      onBlur={() => setAdminTouched((prev) => ({ ...prev, role: true }))}
                      disabled={isViewOnly}
                    >
                      <option value="Temple Admin">Temple Admin</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Trustee">Trustee</option>
                    </SelectInput>
                    {adminTouched.role && adminErrors.role && (
                      <p className="mt-1 text-xs text-red-500">{adminErrors.role}</p>
                    )}
                  </div>
                </FormField>
              </div>

              {mode === "create" ? (
                <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
                  An invite email will be sent once the temple is created. The admin sets their own
                  password. You can resend the invite from the temple detail page.
                </div>
              ) : null}
            </>
          )}

          {step === 2 && (
            <div ref={planSectionRef}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/40">
                    <Layers className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      Plan &amp; Billing
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Choose the plan this temple starts on. You can change it anytime from
                      subscriptions.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  <button
                    type="button"
                    disabled={isViewOnly}
                    onClick={() => {
                      setBillingCycle("Monthly");
                      setStep3Touched((prev) => ({ ...prev, billingCycle: true }));
                    }}
                    className={billingCycle === "Monthly" ? "text-zinc-900 dark:text-white" : "text-zinc-500"}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    role="switch"
                    disabled={isViewOnly}
                    aria-checked={billingCycle === "Annually"}
                    onClick={() => {
                      setBillingCycle(billingCycle === "Annually" ? "Monthly" : "Annually");
                      setStep3Touched((prev) => ({ ...prev, billingCycle: true }));
                    }}
                    className={[
                      "relative h-5 w-10 overflow-hidden rounded-full transition-colors",
                      billingCycle === "Annually"
                        ? "bg-[var(--brand-primary)]"
                        : "bg-zinc-300 dark:bg-zinc-700",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        billingCycle === "Annually" ? "translate-x-5" : "translate-x-0.5",
                      ].join(" ")}
                    />
                  </button>
                  <button
                    type="button"
                    disabled={isViewOnly}
                    onClick={() => {
                      setBillingCycle("Annually");
                      setStep3Touched((prev) => ({ ...prev, billingCycle: true }));
                    }}
                    className={billingCycle === "Annually" ? "text-zinc-900 dark:text-white" : "text-zinc-500"}
                  >
                    Annually (20% Save)
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {catalogPlans.length === 0 ? (
                  <p className="text-sm text-zinc-500 lg:col-span-3">Loading plans…</p>
                ) : (
                  catalogPlans.map((plan) => {
                    const selected = selectedPlanId === plan.id;
                    const price = getDisplayPriceDollars(plan);
                    return (
                      <div
                        key={plan.id}
                        className={[
                          "rounded-xl border p-4 shadow-sm transition-colors",
                          selected
                            ? "border-[var(--brand-primary)] bg-orange-50/30 dark:bg-orange-950/10"
                            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                        ].join(" ")}
                      >
                        <div className="mb-2 flex justify-center">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                            <Layers className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                          </span>
                        </div>
                        <h3 className="text-center text-lg font-semibold text-[var(--brand-primary)]">
                          {plan.name}
                        </h3>
                        {plan.popular ? (
                          <p className="text-center text-xs font-medium text-amber-700 dark:text-amber-400">Popular</p>
                        ) : null}
                        <p className="text-center text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                          ${price.toFixed(0)}
                          <span className="text-3xl">/mth</span>
                        </p>
                        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
                          {billingCycle === "Annually" ? "Billed annually (effective monthly)." : "Billed monthly."}
                        </p>

                        <ul className="mt-4 space-y-2">
                          {Array.isArray(plan.features) &&
                            plan.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                              >
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
                                <span>{feature}</span>
                              </li>
                            ))}
                        </ul>

                        <button
                          type="button"
                          disabled={isViewOnly}
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setStep3Touched((prev) => ({ ...prev, selectedPlan: true }));
                          }}
                          className={[
                            "mt-5 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
                            selected
                              ? "bg-[var(--brand-primary)]"
                              : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600",
                          ].join(" ")}
                        >
                          {selected ? "Selected" : "Get started"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {step3Touched.selectedPlan && step3Errors.selectedPlan && (
                <p className="mt-2 text-xs text-red-500">{step3Errors.selectedPlan}</p>
              )}

              {allowCustomDomain ? (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">
                    Custom domain is included on this plan. Set your hostname in Temple Info.
                  </p>
                  <button
                    type="button"
                    disabled={isViewOnly}
                    onClick={() => setStep(0)}
                    className="mt-2 text-sm font-semibold text-[var(--brand-primary)] hover:underline disabled:opacity-50"
                  >
                    Edit domain
                  </button>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {mode === "create" ? (
                  <div className="rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-3 dark:border-sky-900 dark:bg-sky-950/30 md:col-span-2">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {DEFAULT_TRIAL_DAYS}-day free trial included
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      Every new temple starts on trial. A $0 pro-forma invoice is emailed to the temple admin automatically.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-900/40 md:col-span-2">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Trial ends</p>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{formatTrialEndsAt(trialEndsAt)}</p>
                    {!isViewOnly && tenantId ? (
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <FormField id="extend-trial-days" label="Extend by (days)">
                          <SelectInput
                            id="extend-trial-days"
                            value={extendTrialDays}
                            onChange={(e) => setExtendTrialDays(e.target.value)}
                          >
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">30 days</option>
                          </SelectInput>
                        </FormField>
                        <AdminButton
                          type="button"
                          variant="secondary"
                          disabled={extendTrialBusy}
                          onClick={() => {
                            void (async () => {
                              setExtendTrialBusy(true);
                              setExtendTrialMessage(null);
                              try {
                                const res = await fetch(
                                  `/api/temples/${encodeURIComponent(tenantId)}/extend-trial`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ days: Number(extendTrialDays) }),
                                  },
                                );
                                const data = (await res.json().catch(() => null)) as {
                                  success?: boolean;
                                  data?: { trialEndsAt?: string };
                                  message?: string;
                                };
                                if (!res.ok) {
                                  throw new Error(jsonApiErrorMessage(data) || "Could not extend trial.");
                                }
                                const next = data.data?.trialEndsAt ?? null;
                                if (next) setTrialEndsAt(next);
                                setExtendTrialMessage("Trial extended successfully.");
                              } catch (e) {
                                setExtendTrialMessage(
                                  e instanceof Error ? e.message : "Could not extend trial.",
                                );
                              } finally {
                                setExtendTrialBusy(false);
                              }
                            })();
                          }}
                        >
                          {extendTrialBusy ? "Extending…" : "Extend trial"}
                        </AdminButton>
                      </div>
                    ) : null}
                    {extendTrialMessage ? (
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{extendTrialMessage}</p>
                    ) : null}
                  </div>
                )}

                <div>
                  <FormField id="billing-cycle" label="Billing Cycle" required>
                    <SelectInput
                      id="billing-cycle"
                      value={billingCycle}
                      disabled={isViewOnly}
                      onChange={(e) => {
                        setBillingCycle(e.target.value as BillingCycle);
                        setStep3Touched((prev) => ({ ...prev, billingCycle: true }));
                      }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Annually">Annually (20% Save)</option>
                    </SelectInput>
                  </FormField>
                  {step3Touched.billingCycle && step3Errors.billingCycle && (
                    <p className="mt-1 text-xs text-red-500">{step3Errors.billingCycle}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-6">
              <div className="mb-6 flex gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/40">
                  <Eye className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {mode === "edit" ? "Review & save" : "Review & create"}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mode === "edit"
                      ? "Check everything before saving. Go back to edit any section."
                      : "Check everything before creating. Go back to edit any section."}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Temple Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Temple Name</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{templeName || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Tradition</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{tradition || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Primary Deity</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{deityLabel || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Country</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{countryLabelFromCode(country) || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">City</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{city || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">{allowCustomDomain ? "Custom domain" : "Subdomain"}</dt><dd className="font-medium text-[var(--brand-primary)]">{portalPreviewHost || (allowCustomDomain ? "—" : `${slugPreview}.omkaarya.com`)}</dd></div>
                  </dl>
                </section>

                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Admin Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Full Name</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.fullName || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Email</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.email || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">WhatsApp Number</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.whatsapp || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Plan</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{selectedPlanForReview}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Billing</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{billingCycle || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Trial</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{mode === "edit" ? `Ends ${formatTrialEndsAt(trialEndsAt)}` : `${DEFAULT_TRIAL_DAYS}-day free trial`}</dd></div>
                  </dl>
                </section>
              </div>

              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                {isViewOnly ? (
                  <>Read-only preview — no changes will be saved from this screen.</>
                ) : mode === "edit" ? (
                  <>
                    Saving will update the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{portalPreviewHost}</span> and subscription
                    settings for this temple.
                  </>
                ) : (
                  <>
                    Creating this temple will generate the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{portalPreviewHost}</span>, send an invite to{" "}
                    {invitePayload.admin.email || "the admin"}, and start{" "}
                    a {DEFAULT_TRIAL_DAYS}-day free trial (invoice $0.00 emailed to the admin).
                  </>
                )}
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 py-6">
              <div className="mb-6 flex gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/40">
                  <Eye className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {isViewOnly ? "Temple overview" : mode === "edit" ? "Review & save" : "Review & create"}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {isViewOnly
                      ? "Summary of temple, admin, and subscription details."
                      : mode === "edit"
                        ? "Final confirmation before saving your changes."
                        : "Final confirmation before creating the temple and sending the invite."}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Temple Details</h3>
                    {!isViewOnly ? (
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        Edit
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Temple Name</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{templeName || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Tradition</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{tradition || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Primary Deity</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{deityLabel || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Country</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{countryLabelFromCode(country) || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">City</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{city || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">{allowCustomDomain ? "Custom domain" : "Subdomain"}</dt><dd className="font-medium text-[var(--brand-primary)]">{portalPreviewHost || (allowCustomDomain ? "—" : `${slugPreview}.omkaarya.com`)}</dd></div>
                  </dl>
                </section>

                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Admin Details</h3>
                    {!isViewOnly ? (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        Edit
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Full Name</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.fullName || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Email</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.email || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">WhatsApp Number</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.whatsapp || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Role</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{invitePayload.admin.role || "—"}</dd></div>
                  </dl>
                </section>
                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Activity log</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                      <span className="text-zinc-600 dark:text-zinc-300">Temple created</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                      <span className="text-zinc-600 dark:text-zinc-300">Admin invite sent</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                      <span className="text-zinc-600 dark:text-zinc-300">Compliance documents submitted</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Pending</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-300">Subscription started</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span>
                    </li>
                  </ul>
                </section>
                </div>

                <div className="space-y-4">
                  <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Subscription</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-zinc-500">Plan</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{selectedPlanForReview}</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Status</dt><dd className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">Trial</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Billing</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{billingCycle}</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Next Renewal</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{renewalDateLabel}</dd></div>
                      <div className="flex justify-between"><dt className="text-zinc-500">Amount</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{billingAmountLabel}</dd></div>
                    </dl>
                    <button
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => setStep(2)}
                      className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Change Plan
                    </button>
                  </section>

                  <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">Compliance</h3>
                    <p className="mb-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      Compliance not setup
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      Temple has not submitted compliance documents yet. Basic receipts are active.
                    </p>
                  </section>

                  <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Quick actions</h3>
                    <div className="space-y-2">
                      {[
                        "Login as this temple",
                        "Resend admin invite",
                        "View Microsite",
                        "Download Devotee Data",
                      ].map((label) => (
                        <button
                          key={label}
                          type="button"
                          disabled={isViewOnly}
                          onClick={() => setQuickActionMessage(`${label} is coming soon.`)}
                          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          {label}
                        </button>
                      ))}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={isViewOnly}
                          onClick={() => setQuickActionMessage("Suspend Subscription is coming soon.")}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          Suspend Subscription
                        </button>
                        <button
                          type="button"
                          disabled={isViewOnly}
                          onClick={() => setQuickActionMessage("Delete This Temple is coming soon.")}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete This Temple
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                {isViewOnly ? (
                  <>You are viewing this temple in read-only mode. Use Edit temple above to make changes.</>
                ) : mode === "edit" ? (
                  <>
                    Saving will update the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{portalPreviewHost}</span> and subscription
                    details for this temple.
                  </>
                ) : (
                  <>
                    Creating this temple will generate the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{portalPreviewHost}</span>, send an invite to{" "}
                    {invitePayload.admin.email || "the admin"}, and start{" "}
                    a {DEFAULT_TRIAL_DAYS}-day free trial (invoice $0.00 emailed to the admin).
                  </>
                )}
              </p>
              {quickActionMessage && <p className="text-sm text-zinc-600 dark:text-zinc-300">{quickActionMessage}</p>}
              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
              <PostSaveSuccessBanner text={postSave.bannerText ?? (submitSuccess && !postSave.isLocked ? submitSuccess : null)} />
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          {isViewOnly ? (
            <AdminButton variant="primary" onClick={requestExit}>
              Back to list
            </AdminButton>
          ) : step === 4 ? (
              <>
                <AdminButton variant="outline" onClick={() => setStep(3)}>
                  Back
                </AdminButton>
                <AdminButton variant="outline" onClick={() => setStep(0)}>
                  Edit Temple Details
                </AdminButton>
                <div className="inline-flex">
                  <AdminButton
                    variant="primary"
                    onClick={() => void handleFinalSubmit()}
                    disabled={isSubmitting || postSave.isLocked}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {mode === "edit" ? "Saving…" : "Creating Temple..."}
                      </>
                    ) : mode === "edit" ? (
                      "Save changes"
                    ) : (
                      "Create Temple & Send Invite"
                    )}
                  </AdminButton>
                </div>
              </>
          ) : (
            <>
              <AdminButton variant="outline" onClick={requestExit} disabled={postSave.isLocked}>
                Cancel
              </AdminButton>
              {step > 0 && (
                <AdminButton variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </AdminButton>
              )}
              <AdminButton variant="primary" onClick={onNext} disabled={isSubmitting || postSave.isLocked}>
                {nextButtonLabel(step, mode, isViewOnly)}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </AdminButton>
            </>
          )}
        </div>
      </div>

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />

      {validationToastOpen ? (
        <div
          className="fixed bottom-4 right-4 z-[190] flex max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:bottom-6 sm:right-6"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500"
            aria-hidden
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Required fields</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Please fill in all required fields.
            </p>
          </div>
          <button
            type="button"
            className="-m-1 shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Dismiss"
            onClick={dismissValidationToast}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {noChangesOpen ? (
        <div
          className="fixed bottom-4 right-4 z-[185] max-w-sm rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-lg dark:border-zinc-700 dark:bg-zinc-900 sm:bottom-6 sm:right-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">No changes made</p>
        </div>
      ) : null}

      <DeityUpsertModal
        open={deityModalOpen}
        mode="create"
        initial={null}
        onClose={() => setDeityModalOpen(false)}
        onSaved={() => {
          setDeityModalOpen(false);
          void reloadDeities();
        }}
      />
    </div>
  );
}
