"use client";

import { HelpCircle, Mail, User } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TEMPLE_ONBOARDING_EMAIL_KEY,
  type TempleAdminRole,
} from "@/lib/temple-onboarding-signin";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";
import { getTempleAdminProfileAction } from "@/app/actions/onboarding";

export default function TempleAdminAdminProfilePage() {
  const router = useRouter();
  const fullNameId = useId();
  const emailId = useId();
  const phoneId = useId();

  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState<TempleAdminRole[]>([]);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ROLE_OPTIONS: readonly TempleAdminRole[] = useMemo(
    () => ["Temple Admin", "Head Priest", "Trustee", "Manager", "Accountant"],
    [],
  );

  useEffect(() => {
    const run = async () => {
      const sessionEmail = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
      if (!sessionEmail) {
        router.replace("/temple-admin/signin");
        return;
      }

      try {
        setLoading(true);
        const res = await getTempleAdminProfileAction(sessionEmail);
        if (!res.ok) {
          setError(("message" in res ? res.message : undefined) ?? "Could not load profile.");
          return;
        }
        setEmail(res.profile.email);
        setFullName(res.profile.fullName);
        setWhatsapp(res.profile.phone);
        setRoles((res.profile.roles ?? []) as TempleAdminRole[]);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router]);

  const roleText = useMemo(() => {
    const picked = roles.length ? roles : [];
    return picked.length ? picked.join(", ") : "—";
  }, [roles]);

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
            Your profile details are managed by your organisation.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor={fullNameId} className="text-sm font-medium text-[var(--text-primary)]">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                id={fullNameId}
                type="text"
                value={loading ? "Loading…" : fullName || "—"}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Role</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(roles.length ? roles : ROLE_OPTIONS.slice(0, 0)).map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-medium text-[var(--text-muted)]"
                >
                  {role}
                </span>
              ))}
              {!roles.length ? (
                <span className="text-sm text-[var(--text-muted)]">{loading ? "Loading…" : "—"}</span>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor={emailId} className="text-sm font-medium text-[var(--text-primary)]">
              Email
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <input
                id={emailId}
                type="email"
                value={loading ? "Loading…" : email || "—"}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor={phoneId} className="text-sm font-medium text-[var(--text-primary)]">
              WhatsApp Number
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id={phoneId}
                type="tel"
                value={loading ? "Loading…" : whatsapp || "—"}
                readOnly
                className="min-w-0 flex-1 cursor-not-allowed rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 px-3 text-[var(--text-primary)] focus:outline-none"
              />
              <span className="relative">
                <HelpCircle className="h-5 w-5 text-[var(--text-muted)]" aria-hidden />
                <span className="sr-only">Your organisation sets your WhatsApp number.</span>
              </span>
            </div>
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
                type="button"
                onClick={() => router.push("/temple-admin/temple-profile")}
                disabled={loading}
                className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
              >
                Continue
              </button>
            }
          />
          <p className="text-xs text-[var(--text-muted)]">
            If anything looks incorrect, contact your administrator to update your details.
          </p>
        </div>
      </div>
    </div>
  );
}

