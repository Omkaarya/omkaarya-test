"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  TEMPLE_ONBOARDING_EMAIL_KEY,
  TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY,
  TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY,
  TEMPLE_ONBOARDING_REMEMBER_ME_KEY,
  TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY,
  TEMPLE_ONBOARDING_TEMP_PASSWORD_KEY,
} from "@/lib/temple-onboarding-signin";

const inputBase =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TempleAdminSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFieldId = useId();
  const passwordFieldId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const raw = searchParams.get("email");
    const rawFullName = searchParams.get("fullName") ?? searchParams.get("name");
    const decodedName = rawFullName ? decodeURIComponent(rawFullName.trim()) : "";
    if (decodedName) {
      sessionStorage.setItem(TEMPLE_ONBOARDING_INVITE_FULL_NAME_KEY, decodedName);
    }
    try {
      const savedRemember = localStorage.getItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY);
      const remember = savedRemember === "1";
      setRememberMe(remember);
    } catch {
      // ignore
    }

    if (raw) {
      const decoded = decodeURIComponent(raw.trim());
      if (EMAIL_RE.test(decoded)) {
        setEmail(decoded);
        setEmailPrefilled(true);
        // Editable by default so typos can be corrected; invite link still pre-fills.
        passwordInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
      return;
    }

    try {
      const savedRemember = localStorage.getItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY);
      const rememberedEmail = localStorage.getItem(TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY) ?? "";
      if (savedRemember === "1" && EMAIL_RE.test(rememberedEmail.trim())) {
        setEmail(rememberedEmail.trim());
        passwordInputRef.current?.focus();
        return;
      }
    } catch {
      // ignore
    }

    emailInputRef.current?.focus();
  }, [searchParams]);

  const strengthFill = Math.min(password.length / 12, 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    const pwd = password.trim();
    if (!pwd) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      try {
        localStorage.setItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY, rememberMe ? "1" : "0");
        if (rememberMe) {
          localStorage.setItem(TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY, trimmedEmail);
        } else {
          localStorage.removeItem(TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // ignore
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: trimmedEmail, tempPassword: pwd }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: { firstLogin?: boolean };
        firstLogin?: boolean;
        error?: string | { message?: string };
        message?: string;
      } | null;

      if (response.ok) {
        sessionStorage.setItem(TEMPLE_ONBOARDING_EMAIL_KEY, trimmedEmail);
        const fl =
          data && typeof data === "object" && "data" in data && data.data
            ? data.data?.firstLogin
            : data?.firstLogin;
        const firstLogin = fl !== false;
        if (firstLogin) {
          sessionStorage.removeItem(TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY);
          sessionStorage.setItem(TEMPLE_ONBOARDING_TEMP_PASSWORD_KEY, pwd);
          router.push("/temple-admin/set-password");
        } else {
          sessionStorage.setItem(TEMPLE_ONBOARDING_RETURNING_LOGIN_KEY, "1");
          sessionStorage.removeItem(TEMPLE_ONBOARDING_TEMP_PASSWORD_KEY);
          router.push("/temple-admin");
        }
        return;
      }

      if (response.status === 401) {
        setError("Invalid email or password. Check with your administrator.");
      } else if (response.status === 403) {
        setError(
          jsonApiErrorMessage(data) ||
            "Your trial has ended. Complete payment using the invoice emailed to you, then contact Omkaarya support to restore access.",
        );
      } else {
        setError(jsonApiErrorMessage(data) || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-lg sm:p-6">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Welcome to Omkaarya
        </h1>
        <p className="mt-1.5 text-sm leading-snug text-[var(--text-muted)]">
          Your temple dashboard is ready. Use the temporary password from your invite, or your own
          password if you already created one.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor={emailFieldId} className="text-sm font-medium text-[var(--text-primary)]">
            Email <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              ref={emailInputRef}
              id={emailFieldId}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="olivia@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} pl-10 pr-4`}
              aria-invalid={!!error && !EMAIL_RE.test(email.trim())}
              aria-describedby={emailPrefilled ? `${emailFieldId}-hint` : undefined}
            />
          </div>
          {emailPrefilled ? (
            <p id={`${emailFieldId}-hint`} className="sr-only">
              Email was prefilled from the invitation link. You may edit it if needed.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={passwordFieldId} className="text-sm font-medium text-[var(--text-primary)]">
            Password <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              ref={passwordInputRef}
              id={passwordFieldId}
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBase} pl-10 pr-11`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--border-default)]"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-200 ease-out"
              style={{ width: `${strengthFill * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            First-time sign-in uses your temporary password; you’ll set a permanent password on the
            next step.
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--surface-elevated)]"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          <div className="mt-2 flex justify-end">
            <Link
              href="/temple-admin/forgot-password"
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function SignInFallback() {
  return (
    <div
      className="flex w-full max-w-md min-h-[320px] items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8 shadow-xl"
      aria-busy
    >
      <p className="text-sm text-[var(--text-muted)]">Loading…</p>
    </div>
  );
}

export default function TempleAdminSignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <TempleAdminSignInForm />
    </Suspense>
  );
}
