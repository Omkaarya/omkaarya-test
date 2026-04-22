"use client";

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
import AffixedInput from "@/app/components/admin/AffixedInput";
import FormField from "@/app/components/admin/FormField";
import LogoUpload from "@/app/components/admin/LogoUpload";
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
  type ApiPricingPlan,
  effectiveMonthlyFromYearlyCents,
  getPlanByIdFromList,
} from "@/lib/temple-pricing-plans";

export type TempleWizardMode = "create" | "edit";

export type TempleWizardProps = {
  mode: TempleWizardMode;
  tenantId?: string;
  initialDetail?: SuperAdminTempleDetail | null;
};

/** Temple form country (ISO) → default dial code for phone rows when country changes */
const TEMPLE_COUNTRY_TO_DIAL: Record<string, string> = {
  GB: "+44",
  US: "+1",
  IN: "+91",
  AU: "+61",
  CA: "+1",
};

function dialForCountry(iso: string): string {
  return TEMPLE_COUNTRY_TO_DIAL[iso] ?? "+1";
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

const DEITIES = ["Ganesha", "Shiva", "Vishnu", "Devi", "Hanuman", "Murugan"];
const COUNTRIES = [
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
];
const CITIES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  GB: [
    { value: "London", label: "London" },
    { value: "Birmingham", label: "Birmingham" },
  ],
  US: [
    { value: "New York", label: "New York" },
    { value: "Los Angeles", label: "Los Angeles" },
  ],
  IN: [
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Delhi", label: "Delhi" },
  ],
  AU: [{ value: "Sydney", label: "Sydney" }],
  CA: [{ value: "Toronto", label: "Toronto" }],
};

function nextButtonLabel(step: number, wizardMode: TempleWizardMode): string {
  if (step >= STEP_LABELS.length - 1) return wizardMode === "edit" ? "Save changes" : "Create temple";
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
  trialDays?: string;
};

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
};

type BillingCycle = "Monthly" | "Annually";

function matchCatalogPlanId(plans: ApiPricingPlan[], templePlanName: string): string | null {
  const t = templePlanName.trim();
  return plans.find((p) => p.name === t)?.id ?? null;
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

export default function TempleWizard({ mode, tenantId, initialDetail }: TempleWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const unsavedDialogRef = useRef<HTMLDialogElement>(null);
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
  const [city, setCity] = useState("London");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [whatsapp, setWhatsapp] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [fax, setFax] = useState<PhoneRowValue>(() => emptyPhoneForCountry("GB"));
  const [websitePath, setWebsitePath] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [adminProfileFile, setAdminProfileFile] = useState<File | null>(null);
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
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [trialDays, setTrialDays] = useState<"7" | "14" | "30">("7");
  const [step3Touched, setStep3Touched] = useState({
    selectedPlan: false,
    billingCycle: false,
    trialDays: false,
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
      city,
      address,
      email,
      telephone,
      whatsapp,
      fax,
      websitePath,
      subdomain,
      establishedYear,
      adminFullName,
      adminEmail,
      adminWhatsapp,
      adminRole,
      selectedPlanId,
      billingCycle,
      trialEnabled,
      trialDays,
      logoFileName: logoFile?.name ?? "",
      adminProfileFileName: adminProfileFile?.name ?? "",
    });
  }, [
    tradition,
    templeName,
    deity,
    country,
    city,
    address,
    email,
    telephone,
    whatsapp,
    fax,
    websitePath,
    subdomain,
    establishedYear,
    adminFullName,
    adminEmail,
    adminWhatsapp,
    adminRole,
    selectedPlanId,
    billingCycle,
    trialEnabled,
    trialDays,
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
    setSubdomain(d.temple.subdomain);
    setEstablishedYear(d.temple.establishedYear);
    setAdminFullName(d.admin.fullName);
    setAdminEmail(d.admin.email);
    setAdminWhatsapp(parseAdminWhatsappToRow(d.admin.whatsapp, d.temple.country));
    setAdminRole(d.admin.role);
    const bc = d.planBilling.billingCycle;
    setBillingCycle(bc === "Monthly" || bc === "Annually" ? bc : "Annually");
    setTrialEnabled(d.planBilling.trial.enabled);
    const td = d.planBilling.trial.days;
    if (td === 14) setTrialDays("14");
    else if (td === 30) setTrialDays("30");
    else setTrialDays("7");
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
  }, [mode, tenantId, initialDetail?.planBilling?.selectedPlan]);

  useEffect(() => {
    if (catalogPlans.length === 0) return;
    if (mode === "create" && !selectedPlanId) {
      const def = catalogPlans.find((p) => p.popular)?.id ?? catalogPlans[0]!.id;
      setSelectedPlanId(def);
      return;
    }
    if (mode === "edit" && initialDetail && !didInitPlanIdRef.current) {
      const id = matchCatalogPlanId(catalogPlans, initialDetail.planBilling.selectedPlan);
      if (id) {
        setSelectedPlanId(id);
        didInitPlanIdRef.current = true;
      }
    }
  }, [catalogPlans, mode, initialDetail, selectedPlanId]);

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

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (mode === "edit" && !hydrated) return;
      if (computeSnapshot() !== snapshotRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [mode, hydrated, computeSnapshot]);

  const cityOptions = useMemo(() => {
    const base = CITIES_BY_COUNTRY[country] ?? [];
    if (base.some((c) => c.value === city)) return base;
    if (!city.trim()) return base;
    return [...base, { value: city, label: city }];
  }, [country, city]);

  const deityOptions = useMemo(() => {
    if (!deity.trim() || DEITIES.includes(deity)) return DEITIES;
    return [...DEITIES, deity];
  }, [deity]);

  const handleCountryChange = (next: string) => {
    setCountry(next);
    const cities = CITIES_BY_COUNTRY[next];
    if (cities?.length) setCity(cities[0].value);
    else setCity("");
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

  const slugPreview = subdomain.trim() || "temple_name";

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
    if (trialEnabled && !trialDays) {
      errors.trialDays = "Please select trial days.";
    }
    return errors;
  };

  const step3Errors = getStep3Errors();
  const isStep3Valid = Object.keys(step3Errors).length === 0;

  const selectedPlanData = getPlanByIdFromList(catalogPlans, selectedPlanId ?? undefined);
  const selectedPlanName = selectedPlanData?.name ?? "Sankalpa";

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
        enabled: trialEnabled,
        days: trialEnabled ? Number(trialDays) : null,
      },
    },
  };

  const isDirty = useMemo(() => {
    if (mode === "edit" && !hydrated) return false;
    return computeSnapshot() !== snapshotRef.current;
  }, [mode, hydrated, computeSnapshot]);

  /** Jump back freely; jump forward only when earlier wizard sections are valid (filled). */
  const isStepReachable = (target: number): boolean => {
    if (target < 0 || target >= STEP_LABELS.length) return false;
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
        trialDays: true,
      });
      setStep(2);
    }
  };

  const requestExit = () => {
    if (mode === "edit" && !hydrated) {
      router.push("/super-admin");
      return;
    }
    if (computeSnapshot() !== snapshotRef.current) {
      unsavedDialogRef.current?.showModal();
    } else {
      router.push("/super-admin");
    }
  };

  const handleCreateTemple = async () => {
    if (!canSubmitAllSteps) {
      setSubmitError("Please complete all required information before creating the temple.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload = {
      temple: {
        tradition,
        name: templeName.trim(),
        deity: deity.trim(),
        country,
        city,
        address: address.trim(),
        email: email.trim(),
        phone: telephone,
        whatsapp,
        fax,
        website: websitePath.trim(),
        subdomain: slugPreview,
        establishedYear: establishedYear.trim(),
      },
      admin: {
        fullName: adminFullName.trim(),
        email: adminEmail.trim(),
        whatsapp: formatPhoneRowForApi(adminWhatsapp),
        role: adminRole,
      },
      planBilling: {
        selectedPlan: selectedPlanName,
        billingCycle,
        trial: {
          enabled: trialEnabled,
          days: trialEnabled ? Number(trialDays) : null,
        },
      },
    };

    try {
      const response = await fetch("/api/temples/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as
        | { success: true; data: { temporaryPassword?: string; inviteEmailSent?: boolean } }
        | { success?: boolean; data?: { temporaryPassword?: string; inviteEmailSent?: boolean }; temporaryPassword?: string; inviteEmailSent?: boolean; error?: unknown }
        | null;
      if (!response.ok) {
        throw new Error(jsonApiErrorMessage(data) || "Failed to create temple.");
      }
      const inner =
        data && typeof data === "object" && "data" in data && data && (data as { data?: unknown }).data
          ? (data as { data: { temporaryPassword?: string; inviteEmailSent?: boolean } }).data
          : (data as { temporaryPassword?: string; inviteEmailSent?: boolean } | null);
      const tempPwd =
        inner && typeof inner.temporaryPassword === "string" ? inner.temporaryPassword : "";
      const inviteEmailSent =
        inner && "inviteEmailSent" in inner && typeof inner.inviteEmailSent === "boolean"
          ? inner.inviteEmailSent
          : undefined;
      setSubmitSuccess(
        inviteEmailSent === true
            ? "Temple successfully created. An invite email has been sent to the admin."
            : inviteEmailSent === false
              ? "Temple successfully created, but invite email could not be sent (email not configured or SMTP failed)."
              : "Temple successfully created."
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create temple.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTemple = async () => {
    if (!canSubmitAllSteps || mode !== "edit" || !tenantId?.trim()) {
      setSubmitError("Please complete all required information before saving.");
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
        address: address.trim(),
        email: email.trim(),
        phone: telephone,
        whatsapp,
        fax,
        website: websitePath.trim(),
        subdomain: subdomain.trim() || "temple_name",
        establishedYear: establishedYear.trim(),
      },
      admin: {
        fullName: adminFullName.trim(),
        whatsapp: formatPhoneRowForApi(adminWhatsapp),
        role: adminRole,
      },
      planBilling: {
        selectedPlan: selectedPlanName,
        billingCycle,
        trial: {
          enabled: trialEnabled,
          days: trialEnabled ? Number(trialDays) : null,
        },
      },
    };

    if (logoFile) {
      try {
        body.logoTempleDataUrl = await readFileAsDataUrl(logoFile);
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
      setSubmitSuccess(
        data && typeof data === "object" && "message" in data && typeof (data as { message: string }).message === "string"
          ? (data as { message: string }).message
          : "Temple updated successfully."
      );
      snapshotRef.current = computeSnapshot();
      setInitialTempleLogoDataUrl(
        typeof body.logoTempleDataUrl === "string" ? body.logoTempleDataUrl : initialTempleLogoDataUrl
      );
      setLogoFile(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update temple.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
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
        trialDays: true,
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
        trialDays: true,
      });
      showRequiredFieldsToast();
      return;
    }
    if (step >= STEP_LABELS.length - 1) {
      void handleFinalSubmit();
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
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <WizardStepper
          currentStep={step}
          onStepClick={handleWizardStepClick}
          isStepReachable={isStepReachable}
        />

        <div className="mt-10">
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
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField id="temple-name" label="Temple Name" required>
                  <div>
                    <TextInput
                      id="temple-name"
                      value={templeName}
                      onChange={(e) => setTempleName(e.target.value)}
                      placeholder="e.g. Shiva Mandir London"
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
                      className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
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
                    >
                      <option value="">Select deity</option>
                      {deityOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
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
                    >
                      {COUNTRIES.map((c) => (
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

                <FormField id="city" label="City" required>
                  <div>
                    <SelectInput id="city" value={city} onChange={(e) => setCity(e.target.value)}>
                      {cityOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </SelectInput>
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
                    />
                    {step1ShowErrors && step1Errors.email ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.email}</p>
                    ) : null}
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <PhoneFieldsGroup
                    telephone={telephone}
                    whatsapp={whatsapp}
                    fax={fax}
                    onChange={handlePhoneChange}
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
                </div>

                <FormField id="website" label="Website">
                  <AffixedInput
                    id="website"
                    prefix="http://"
                    value={websitePath}
                    onChange={(e) => setWebsitePath(e.target.value)}
                    placeholder="www.yourtemple.org"
                  />
                </FormField>

                <FormField
                  id="subdomain"
                  label="Sub Domain URL"
                  hint={`Microsite will be live at: ${slugPreview}.omkaarya.com`}
                >
                  <AffixedInput
                    id="subdomain"
                    suffix=".omkaarya.com"
                    suffixAction={
                      <button
                        type="button"
                        className="rounded-md bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                      >
                        Upgrade
                      </button>
                    }
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    placeholder="your-temple"
                  />
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
                    />
                    {step1ShowErrors && step1Errors.establishedYear ? (
                      <p className="mt-1 text-xs text-red-500">{step1Errors.establishedYear}</p>
                    ) : null}
                  </div>
                </FormField>
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
                      disabled={mode === "edit"}
                      readOnly={mode === "edit"}
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
                />

                <FormField
                  id="admin-role"
                  label="Role / Title"
                  required
                  topRight={
                    <button
                      type="button"
                      className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
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
            <div>
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

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={trialEnabled}
                      onClick={() => {
                        setTrialEnabled((prev) => !prev);
                        setStep3Touched((prev) => ({ ...prev, trialDays: true }));
                      }}
                      className={[
                        "relative h-5 w-10 overflow-hidden rounded-full transition-colors",
                        trialEnabled ? "bg-[var(--brand-primary)]" : "bg-zinc-300 dark:bg-zinc-700",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                          trialEnabled ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </button>
                    If Enabled Trial
                  </label>
                </div>

                {trialEnabled && (
                  <div>
                    <FormField id="trial-days" label="Number of Days" required>
                      <SelectInput
                        id="trial-days"
                        value={trialDays}
                        onChange={(e) => {
                          setTrialDays(e.target.value as "7" | "14" | "30");
                          setStep3Touched((prev) => ({ ...prev, trialDays: true }));
                        }}
                      >
                        <option value="7">7 - days free trial</option>
                        <option value="14">14 - days free trial</option>
                        <option value="30">30 - days free trial</option>
                      </SelectInput>
                    </FormField>
                    {step3Touched.trialDays && step3Errors.trialDays && (
                      <p className="mt-1 text-xs text-red-500">{step3Errors.trialDays}</p>
                    )}
                  </div>
                )}

                <div className={trialEnabled ? "" : "md:col-start-2"}>
                  <FormField id="billing-cycle" label="Billing Cycle" required>
                    <SelectInput
                      id="billing-cycle"
                      value={billingCycle}
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
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Primary Deity</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{deity || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Country</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{country || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">City</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{city || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Subdomain</dt><dd className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</dd></div>
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
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Trial</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{trialEnabled ? `${trialDays}-day free trial` : "Disabled"}</dd></div>
                  </dl>
                </section>
              </div>

              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                {mode === "edit" ? (
                  <>
                    Saving will update the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</span> and subscription
                    settings for this temple.
                  </>
                ) : (
                  <>
                    Creating this temple will generate the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</span>, send an invite to{" "}
                    {invitePayload.admin.email || "the admin"}, and start{" "}
                    {trialEnabled ? `${trialDays}-day free trial` : "the selected billing cycle"}.
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
                    {mode === "edit" ? "Review & save" : "Review & create"}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mode === "edit"
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
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Temple Name</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{templeName || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Tradition</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{tradition || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Primary Deity</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{deity || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Country</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{country || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">City</dt><dd className="font-medium text-zinc-900 dark:text-zinc-100">{city || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Subdomain</dt><dd className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</dd></div>
                  </dl>
                </section>

                <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Admin Details</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      Edit
                    </button>
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
                      onClick={() => setStep(2)}
                      className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
                          onClick={() => setQuickActionMessage(`${label} is coming soon.`)}
                          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          {label}
                        </button>
                      ))}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickActionMessage("Suspend Subscription is coming soon.")}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          Suspend Subscription
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickActionMessage("Delete This Temple is coming soon.")}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                          Delete This Temple
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300">
                {mode === "edit" ? (
                  <>
                    Saving will update the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</span> and subscription
                    details for this temple.
                  </>
                ) : (
                  <>
                    Creating this temple will generate the microsite at{" "}
                    <span className="font-medium text-[var(--brand-primary)]">{slugPreview}.omkaarya.com</span>, send an invite to{" "}
                    {invitePayload.admin.email || "the admin"}, and start{" "}
                    {trialEnabled ? `${trialDays}-day free trial` : "the selected billing cycle"}.
                  </>
                )}
              </p>
              {quickActionMessage && <p className="text-sm text-zinc-600 dark:text-zinc-300">{quickActionMessage}</p>}
              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
              {submitSuccess && <p className="text-sm text-emerald-600">{submitSuccess}</p>}
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          {step === 4 ? (
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
                  disabled={isSubmitting}
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
              <AdminButton variant="outline" onClick={requestExit}>
                Cancel
              </AdminButton>
              {step > 0 && (
                <AdminButton variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </AdminButton>
              )}
              <AdminButton variant="primary" onClick={onNext} disabled={isSubmitting}>
                {nextButtonLabel(step, mode)}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </AdminButton>
            </>
          )}
        </div>
      </div>

      <dialog
        ref={unsavedDialogRef}
        className="w-[min(100%-2rem,42rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <h3 className="text-lg font-semibold">Unsaved changes</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You have unsaved changes. Leave without saving?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton variant="outline" type="button" onClick={() => unsavedDialogRef.current?.close()}>
            Stay
          </AdminButton>
          <AdminButton
            variant="primary"
            type="button"
            onClick={() => {
              unsavedDialogRef.current?.close();
              router.push("/super-admin");
            }}
          >
            Leave without saving
          </AdminButton>
        </div>
      </dialog>

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
    </div>
  );
}
