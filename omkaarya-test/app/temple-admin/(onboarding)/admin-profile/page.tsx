"use client";

import { ArrowLeft, ArrowRight, ChevronDown, HelpCircle, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  markTempleOnboardingAdminProfileSeen,
  TEMPLE_ONBOARDING_EMAIL_KEY,
} from "@/lib/temple-onboarding-signin";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

const inputBase =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { label: "Temple Administrator", slug: "admin" },
  { label: "Trustee", slug: "trustee" },
  { label: "Head Priest", slug: "priest-head" },
  { label: "Priest", slug: "priest-head" },
  { label: "Accountant", slug: "accountant" },
  { label: "Manager", slug: "manager" },
  { label: "Inventory Manager", slug: "inventory-manager" },
  { label: "Donation Manager", slug: "accountant" },
  { label: "Volunteer Coordinator", slug: "manager" },
  { label: "Reception Staff", slug: "counter" },
  { label: "Auditor", slug: "accountant" },
] as const;

const COUNTRY_OPTIONS = [
  { label: "🇺🇸 +1", code: "+1" },
  { label: "🇮🇳 +91", code: "+91" },
  { label: "🇱🇰 +94", code: "+94" },
  { label: "🇬🇧 +44", code: "+44" },
  { label: "🇦🇺 +61", code: "+61" },
  { label: "🇨🇦 +1", code: "+1-CA" },
  { label: "🇸🇬 +65", code: "+65" },
  { label: "🇦🇪 +971", code: "+971" },
  { label: "🇩🇪 +49", code: "+49" },
] as const;

export default function TempleAdminAdminProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("Temple Administrator");
  const [countryCode, setCountryCode] = useState("+94"); // Default to +94
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountryOption = COUNTRY_OPTIONS.find((c) => c.code === countryCode);
  const countryDisplayLabel = selectedCountryOption ? selectedCountryOption.label : countryCode;

  useEffect(() => {
    const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!sessionEmail) {
      router.replace("/temple-admin/signin");
    }
  }, [router]);

  const handleSkip = () => {
    markTempleOnboardingAdminProfileSeen();
    router.push("/temple-admin/temple-profile");
  };

  const handleRoleToggle = (label: string) => {
    if (selectedRole === label) {
      setSelectedRole("");
    } else {
      setSelectedRole(label);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameTrim = fullName.trim();
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (!nameTrim) {
      setError("Full Name is required.");
      return;
    }
    if (!emailTrim) {
      setError("Email is required.");
      return;
    }
    if (!EMAIL_RE.test(emailTrim)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }
    if (!phoneTrim) {
      setError("WhatsApp number is required.");
      return;
    }

    setLoading(true);
    try {
      const parts = nameTrim.split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      const roleOption = ROLE_OPTIONS.find((r) => r.label === selectedRole);
      const roleSlug = roleOption ? roleOption.slug : "admin";

      // Call API to create/invite the staff member
      await fetchTempleAdminJson("/api/temple-admin/peoples/staff", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email: emailTrim,
          phone: phoneTrim,
          phoneCountryCode: countryCode,
          roleSlug,
          status: "active",
        }),
      });

      markTempleOnboardingAdminProfileSeen();
      router.push("/temple-admin/temple-profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite staff member.");
    } finally {
      setLoading(false);
    }
  };

  const avatarInitials = useMemo(() => {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (fullName.trim()) return fullName.slice(0, 2).toUpperCase();
    return "TA";
  }, [fullName]);

  return (
    <div className="w-full max-w-xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0" aria-hidden="true">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          className="text-orange-200/50 dark:text-[var(--brand-primary)]/15"
        >
          <circle cx="0" cy="0" r="30" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="55" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="80" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="105" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="130" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="155" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Build Your Temple Team
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Invite trustees, priests, accountants, and staff who will help manage temple operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Full Name <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="relative mt-1.5">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Rajan Pillai"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`${inputBase} pl-10 pr-4`}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Email <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} pl-10 pr-4`}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Role at the temple (e.g. Head Trustee, Temple Secretary, Priest) <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = selectedRole === role.label;
                return (
                  <button
                    key={role.label}
                    type="button"
                    onClick={() => handleRoleToggle(role.label)}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all border",
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-300"
                        : "bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5",
                    ].join(" ")}
                  >
                    {role.label}
                    {isSelected && <span className="text-emerald-500">×</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              WhatsApp Number <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="relative mt-1.5 flex items-stretch overflow-hidden w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]">
              <div className="relative flex items-center shrink-0 border-r border-[var(--border-default)] px-3 bg-zinc-50/50 dark:bg-zinc-800/20">
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-primary)] pointer-events-none whitespace-nowrap">
                  <span>{countryDisplayLabel}</span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" aria-hidden />
                </div>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-grow">
                <input
                  type="tel"
                  placeholder="Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full border-0 bg-transparent py-2.5 pl-3 pr-10 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-0"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <HelpCircle className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              We&apos;ll use this for urgent support only
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-zinc-100 pt-5 mt-6 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-[var(--surface-card)] px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Skip now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving…" : "Save & Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
