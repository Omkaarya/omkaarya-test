"use client";

import { ArrowRight, HelpCircle, Mail, User } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadTempleAdminProfileDraft,
  saveTempleAdminProfileDraft,
  TEMPLE_ONBOARDING_EMAIL_KEY,
  TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY,
  type TempleAdminRole,
} from "@/lib/temple-onboarding-signin";
import { PHONE_COUNTRY_OPTIONS } from "@/app/components/admin/phoneCountryOptions";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { submitTempleAdminProfile } from "@/lib/temple-admin-onboarding-api";

export default function TempleAdminAdminProfilePage() {
  const router = useRouter();
  const fullNameId = useId();
  const emailId = useId();
  const phoneIdPrefix = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState<TempleAdminRole[]>(["Temple Admin"]);
  const [email, setEmail] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+91");
  const [whatsappNationalNumber, setWhatsappNationalNumber] = useState("");
  const [touched, setTouched] = useState({
    fullName: false,
    roles: false,
    email: false,
    whatsapp: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ROLE_OPTIONS: readonly TempleAdminRole[] = useMemo(
    () => ["Temple Admin", "Head Priest", "Trustee", "Manager", "Accountant"],
    [],
  );

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }

    const draft = loadTempleAdminProfileDraft();
    const inviteName = sessionStorage.getItem(TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY) ?? "";

    const initialEmail = (draft?.email ?? email).trim();
    const initialName = (draft?.fullName ?? inviteName).trim();
    const initialRoles = (draft?.roles?.length ? draft.roles : ["Temple Admin"]) as TempleAdminRole[];
    const initialWaCc = (draft?.whatsapp?.countryCode ?? "+91").trim();
    const initialWaNum = (draft?.whatsapp?.nationalNumber ?? "").trim();

    setEmail(initialEmail);
    setFullName(initialName);
    setRoles(initialRoles);
    setWhatsappCountryCode(initialWaCc);
    setWhatsappNationalNumber(initialWaNum);

    firstInputRef.current?.focus();
  }, [router]);

  useEffect(() => {
    saveTempleAdminProfileDraft({
      fullName,
      email,
      roles,
      whatsapp: { countryCode: whatsappCountryCode, nationalNumber: whatsappNationalNumber },
    });
  }, [email, fullName, roles, whatsappCountryCode, whatsappNationalNumber]);

  const EMAIL_RE = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const validation = useMemo(() => {
    const errs: {
      fullName?: string;
      roles?: string;
      email?: string;
      whatsapp?: string;
    } = {};

    const name = fullName.trim();
    if (!name) errs.fullName = "Full name is required.";

    if (!roles.length) errs.roles = "Select at least one role.";

    const e = email.trim();
    if (!e) errs.email = "Email is required.";
    else if (!EMAIL_RE.test(e)) errs.email = "Enter a valid email address.";

    const digits = whatsappNationalNumber.replace(/[^\d]/g, "");
    if (!digits) errs.whatsapp = "WhatsApp number is required.";
    else if (digits.length < 7 || digits.length > 15) errs.whatsapp = "Enter a valid phone number.";

    const ok = !errs.fullName && !errs.roles && !errs.email && !errs.whatsapp;
    return { ok, errs, phoneDigits: digits };
  }, [EMAIL_RE, email, fullName, roles, whatsappNationalNumber]);

  const canSubmit = validation.ok && !loading;

  function toggleRole(role: TempleAdminRole) {
    setRoles((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      return [...prev, role];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTouched({ fullName: true, roles: true, email: true, whatsapp: true });
    if (!validation.ok) return;

    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        sessionEmail: sessionEmail.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        roles,
        phone: `${whatsappCountryCode}${validation.phoneDigits}`,
      };
      const res = await submitTempleAdminProfile(payload);
      if (!res.ok) {
        setError(res.message || "Something went wrong. Please try again.");
        return;
      }
      if (payload.email !== sessionEmail.trim()) {
        sessionStorage.setItem(TEMPLE_ONBOARDING_EMAIL_KEY, payload.email);
      }
      router.push("/temple-admin/temple-profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full border border-orange-200/50 dark:border-[var(--brand-primary)]/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-28 -top-36 h-72 w-72 rounded-full border border-orange-200/35 dark:border-[var(--brand-primary)]/10"
          aria-hidden
        />

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Admin Profile</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Helps your team and devotees recognise you across the platform.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={fullNameId} className="text-sm font-medium text-[var(--text-primary)]">
              Full Name <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="relative mt-1.5">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                ref={firstInputRef}
                id={fullNameId}
                type="text"
                name="fullName"
                autoComplete="name"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                aria-invalid={touched.fullName && !!validation.errs.fullName}
              />
            </div>
            {touched.fullName && validation.errs.fullName ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validation.errs.fullName}</p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Role <span className="text-red-600 dark:text-red-400">*</span>
            </p>
            <div
              className="mt-2 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Select roles"
            >
              {ROLE_OPTIONS.map((role) => {
                const selected = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    onBlur={() => setTouched((t) => ({ ...t, roles: true }))}
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    <span>{role}</span>
                    {selected ? (
                      <span
                        aria-hidden
                        className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                      >
                        ×
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {touched.roles && validation.errs.roles ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validation.errs.roles}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor={emailId} className="text-sm font-medium text-[var(--text-primary)]">
              Email <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                aria-invalid={touched.email && !!validation.errs.email}
              />
            </div>
            {touched.email && validation.errs.email ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validation.errs.email}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor={`${phoneIdPrefix}-wa`} className="text-sm font-medium text-[var(--text-primary)]">
              WhatsApp Number <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                aria-label="WhatsApp country code"
                value={whatsappCountryCode}
                onChange={(e) => setWhatsappCountryCode(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                className="w-24 shrink-0 rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none ring-[var(--brand-primary)] focus:ring-2"
              >
                {PHONE_COUNTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                id={`${phoneIdPrefix}-wa`}
                type="tel"
                placeholder="(555) 678 7890"
                value={whatsappNationalNumber}
                onChange={(e) => setWhatsappNationalNumber(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                className="min-w-0 flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                aria-invalid={touched.whatsapp && !!validation.errs.whatsapp}
              />
              <span className="relative">
                <HelpCircle className="h-5 w-5 text-[var(--text-muted)]" aria-hidden />
                <span className="sr-only">Enter a number you can receive WhatsApp messages on.</span>
              </span>
            </div>
            {touched.whatsapp && validation.errs.whatsapp ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validation.errs.whatsapp}</p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <TempleOnboardingStepActions
            onBack={() => router.push("/temple-admin/set-password")}
            primary={
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Saving…" : "Create Account & Continue"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            }
          />
        </form>
      </div>
    </div>
  );
}

