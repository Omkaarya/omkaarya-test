"use client";

import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TEMPLE_ONBOARDING_EMAIL_KEY,
  TEMPLE_ONBOARDING_REMEMBER_ME_KEY,
} from "@/lib/temple-onboarding-signin";
import TempleOnboardingStepActions from "@/app/components/temple-admin/TempleOnboardingStepActions";

const inputBase =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";

function strengthLabel(password: string): "Weak" | "Medium" | "Strong" {
  const p = password;
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  if (score >= 4) return "Strong";
  if (score >= 2) return "Medium";
  return "Weak";
}

export default function TempleAdminSetPasswordPage() {
  const router = useRouter();
  const newPwdId = useId();
  const confirmPwdId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }
    const savedRemember = localStorage.getItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY);
    if (savedRemember === "1") setRememberMe(true);
    firstInputRef.current?.focus();
  }, [router]);

  const validation = useMemo(() => {
    const trimmed = newPassword;
    const confirm = confirmPassword;
    const errs: { newPassword?: string; confirmPassword?: string } = {};

    if (!trimmed.trim()) errs.newPassword = "New password is required.";
    else if (trimmed.length < 8) errs.newPassword = "Password must be at least 8 characters.";

    if (!confirm.trim()) errs.confirmPassword = "Please confirm your new password.";
    else if (trimmed !== confirm) errs.confirmPassword = "Passwords do not match.";

    const ok = !errs.newPassword && !errs.confirmPassword;
    return { ok, errs };
  }, [newPassword, confirmPassword]);

  const strength = useMemo(() => strengthLabel(newPassword), [newPassword]);
  const strengthFill = Math.min(newPassword.length / 14, 1);
  const strengthColor =
    strength === "Strong" ? "bg-emerald-500" : strength === "Medium" ? "bg-amber-500" : "bg-rose-500";

  const canSubmit = validation.ok && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTouched({ newPassword: true, confirmPassword: true });
    if (!validation.ok) return;

    const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
    if (!email) {
      router.replace("/temple-admin/signin");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY, rememberMe ? "1" : "0");
      // API integration intentionally deferred. For now, proceed after local validation only.
      router.push("/temple-admin/admin-profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Create a New Password
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Your temporary password expires after first use. Choose something you&apos;ll remember.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor={newPwdId} className="text-sm font-medium text-[var(--text-primary)]">
            New Password <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              ref={firstInputRef}
              id={newPwdId}
              type={showNew ? "text" : "password"}
              name="newPassword"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
              className={`${inputBase} pl-10 pr-11`}
              aria-invalid={touched.newPassword && !!validation.errs.newPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {touched.newPassword && validation.errs.newPassword ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validation.errs.newPassword}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={confirmPwdId} className="text-sm font-medium text-[var(--text-primary)]">
            Confirm New Password <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              id={confirmPwdId}
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              className={`${inputBase} pl-10 pr-11`}
              aria-invalid={touched.confirmPassword && !!validation.errs.confirmPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {touched.confirmPassword && validation.errs.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {validation.errs.confirmPassword}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            Use a mix of letters, numbers, and symbols for a stronger password.
          </p>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Password strength: {strength}</span>
            <span>{Math.max(newPassword.length, 0)} chars</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border-default)]" aria-hidden>
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-out ${strengthColor}`}
              style={{ width: `${strengthFill * 100}%` }}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--surface-elevated)]"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <TempleOnboardingStepActions
          onBack={() => router.push("/temple-admin/signin")}
          primary={
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full min-w-0 flex-[1.25] items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Saving…" : "Set Password & Continue"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          }
        />
      </form>
    </div>
  );
}
