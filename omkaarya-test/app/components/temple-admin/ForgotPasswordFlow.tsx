"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { forgotPasswordStepFromQuery } from "@/app/components/temple-admin/ForgotPasswordStepper";
import {
  clearTempleForgotPasswordSession,
  TEMPLE_FORGOT_EMAIL_KEY,
  TEMPLE_FORGOT_RESET_TOKEN_KEY,
} from "@/lib/temple-forgot-password";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import {
  TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY,
  TEMPLE_ONBOARDING_REMEMBER_ME_KEY,
} from "@/lib/temple-onboarding-signin";

const inputBase =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function OmkaaryaCardMark() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className="mx-auto shrink-0 text-[var(--brand-primary)]"
      aria-hidden
    >
      <circle cx="18" cy="20" r="10" fill="currentColor" opacity="0.2" />
      <path
        d="M18 8c-4 0-7 2.5-7 6 0 2 1.2 3.6 3 4.5V26h8v-7.5c1.8-.9 3-2.5 3-4.5 0-3.5-3-6-7-6z"
        fill="currentColor"
      />
      <path
        d="M14 10c1.2-1.5 2.5-2 4-2s2.8.5 4 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function strengthSegmentCount(password: string): number {
  const p = password;
  if (!p.trim()) return 0;
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  return Math.min(4, score);
}

function StrengthSegments({ count }: { count: number }) {
  return (
    <div className="mt-2 flex gap-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={[
            "h-1 flex-1 rounded-full transition-colors",
            i < count ? "bg-emerald-500" : "bg-[var(--border-default)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

async function readErrorMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as unknown;
  return jsonApiErrorMessage(data) || "Something went wrong. Please try again.";
}

export default function ForgotPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const stepIndex = forgotPasswordStepFromQuery(stepParam);

  const emailFieldId = useId();
  const newPwdId = useId();
  const confirmPwdId = useId();

  const [email, setEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendHint, setResendHint] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetTouched, setResetTouched] = useState({ newPassword: false, confirmPassword: false });
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const [flowEmail, setFlowEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const em = sessionStorage.getItem(TEMPLE_FORGOT_EMAIL_KEY);
    const token = sessionStorage.getItem(TEMPLE_FORGOT_RESET_TOKEN_KEY);

    if (stepIndex === 1 && !em) {
      router.replace("/temple-admin/forgot-password");
      return;
    }
    if (stepIndex === 2 && !token) {
      router.replace(em ? "/temple-admin/forgot-password?step=otp" : "/temple-admin/forgot-password");
      return;
    }
    if (stepIndex === 3 && !token) {
      router.replace(em ? "/temple-admin/forgot-password?step=otp" : "/temple-admin/forgot-password");
      return;
    }
  }, [stepIndex, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStore = sessionStorage.getItem(TEMPLE_FORGOT_EMAIL_KEY) ?? "";
    setFlowEmail(fromStore);
    if (stepIndex === 0 && fromStore) setEmail(fromStore);
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex === 1) {
      setOtpDigits(["", "", "", ""]);
      setOtpError("");
      setResendHint("");
      queueMicrotask(() => otpRefs.current[0]?.focus());
    }
  }, [stepIndex]);

  useEffect(() => {
    if (stepIndex === 3) {
      const savedRemember = localStorage.getItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY);
      if (savedRemember === "1") setRememberMe(true);
    }
  }, [stepIndex]);

  const resetValidation = useMemo(() => {
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

  const newStrength = strengthSegmentCount(newPassword);
  const confirmStrength =
    newPassword === confirmPassword && confirmPassword.trim().length > 0 ? newStrength : 0;

  const canSubmitReset = resetValidation.ok && !resetSubmitting;

  const goLogin = useCallback(() => {
    clearTempleForgotPasswordSession();
  }, []);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email is required.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailSubmitting(true);
    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!response.ok) {
        setEmailError(await readErrorMessage(response));
        return;
      }
      sessionStorage.setItem(TEMPLE_FORGOT_EMAIL_KEY, trimmed);
      setFlowEmail(trimmed);
      router.replace("/temple-admin/forgot-password?step=otp");
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSubmitting(false);
    }
  }

  function setOtpAt(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;
    const chars = text.split("");
    setOtpDigits([0, 1, 2, 3].map((i) => chars[i] ?? ""));
    const focusIndex = Math.min(chars.length, 3);
    otpRefs.current[focusIndex]?.focus();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    const otp = otpDigits.join("");
    const em = sessionStorage.getItem(TEMPLE_FORGOT_EMAIL_KEY);
    if (!em) {
      router.replace("/temple-admin/forgot-password");
      return;
    }
    if (!/^\d{4}$/.test(otp)) {
      setOtpError("Enter the 4-digit code.");
      return;
    }

    setOtpSubmitting(true);
    try {
      const response = await fetch("/api/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: em, otp }),
      });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: { resetToken?: string };
        resetToken?: string;
        error?: unknown;
      } | null;
      if (!response.ok) {
        setOtpError(jsonApiErrorMessage(data) || "Something went wrong. Please try again.");
        return;
      }
      const token =
        data && "data" in data && data.data && typeof data.data.resetToken === "string"
          ? data.data.resetToken
          : data && typeof data === "object" && "resetToken" in data && typeof (data as { resetToken: string }).resetToken === "string"
            ? (data as { resetToken: string }).resetToken
            : "";
      if (!token) {
        setOtpError("Something went wrong. Please try again.");
        return;
      }
      sessionStorage.setItem(TEMPLE_FORGOT_RESET_TOKEN_KEY, token);
      router.replace("/temple-admin/forgot-password?step=verified");
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function handleResend() {
    const em = sessionStorage.getItem(TEMPLE_FORGOT_EMAIL_KEY);
    if (!em) return;
    setResendBusy(true);
    setResendHint("");
    setOtpError("");
    try {
      const response = await fetch("/api/password-reset/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: em }),
      });
      if (response.ok) {
        setResendHint("A new code was sent if an account exists for this email.");
      } else {
        setOtpError(await readErrorMessage(response));
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setResendBusy(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetTouched({ newPassword: true, confirmPassword: true });
    if (!resetValidation.ok) return;

    const em = sessionStorage.getItem(TEMPLE_FORGOT_EMAIL_KEY);
    const resetToken = sessionStorage.getItem(TEMPLE_FORGOT_RESET_TOKEN_KEY);
    if (!em || !resetToken) {
      router.replace("/temple-admin/forgot-password");
      return;
    }

    const newPwd = newPassword.trim();
    setResetSubmitting(true);
    try {
      try {
        localStorage.setItem(TEMPLE_ONBOARDING_REMEMBER_ME_KEY, rememberMe ? "1" : "0");
        if (rememberMe) {
          localStorage.setItem(TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY, em);
        } else {
          localStorage.removeItem(TEMPLE_ONBOARDING_REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // ignore
      }
      const response = await fetch("/api/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: em,
          resetToken,
          newPassword: newPwd,
          confirmNewPassword: confirmPassword.trim(),
        }),
      });
      if (!response.ok) {
        setResetError(await readErrorMessage(response));
        return;
      }
      clearTempleForgotPasswordSession();
      router.replace("/temple-admin/forgot-password?step=done");
    } catch {
      setResetError("Network error. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  }

  const supportLine = (
    <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
      Need help? Contact Support{" "}
      <a href="mailto:support@omkaarya.com" className="text-[var(--brand-primary)] hover:underline">
        support@omkaarya.com
      </a>
    </p>
  );

  if (stepIndex === 4) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <OmkaaryaCardMark />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              You are all set
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Your password has been updated. Sign in with your new password to continue.
            </p>
          </div>
          <Link
            href="/temple-admin/signin"
            onClick={goLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            Back to sign in
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {supportLine}
      </div>
    );
  }

  if (stepIndex === 2) {
    const em = flowEmail;
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <OmkaaryaCardMark />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Email verified
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Your identity is confirmed for{" "}
              <span className="font-medium text-[var(--text-primary)]">{em || "your email"}</span>.
              Continue to choose a new password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.replace("/temple-admin/forgot-password?step=reset")}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            <Link
              href="/temple-admin/signin"
              onClick={goLogin}
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
        {supportLine}
      </div>
    );
  }

  if (stepIndex === 3) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <OmkaaryaCardMark />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Reset your Password
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Enter and confirm your new password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleResetSubmit} noValidate>
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
                  id={newPwdId}
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setResetTouched((t) => ({ ...t, newPassword: true }))}
                  className={`${inputBase} pl-10 pr-11`}
                  aria-invalid={resetTouched.newPassword && !!resetValidation.errs.newPassword}
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
              <StrengthSegments count={newStrength} />
              {resetTouched.newPassword && resetValidation.errs.newPassword ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {resetValidation.errs.newPassword}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={confirmPwdId} className="text-sm font-medium text-[var(--text-primary)]">
                Confirm Password <span className="text-red-600 dark:text-red-400">*</span>
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
                  onBlur={() => setResetTouched((t) => ({ ...t, confirmPassword: true }))}
                  className={`${inputBase} pl-10 pr-11`}
                  aria-invalid={resetTouched.confirmPassword && !!resetValidation.errs.confirmPassword}
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
              <StrengthSegments count={confirmStrength} />
              {resetTouched.confirmPassword && resetValidation.errs.confirmPassword ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {resetValidation.errs.confirmPassword}
                </p>
              ) : null}
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

            {resetError ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {resetError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmitReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {resetSubmitting ? "Saving…" : "Save Password"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            <Link
              href="/temple-admin/signin"
              onClick={goLogin}
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
        {supportLine}
      </div>
    );
  }

  if (stepIndex === 1) {
    const em = flowEmail;
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <OmkaaryaCardMark />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              We sent a verification code to{" "}
              <span className="font-medium text-[var(--text-primary)]">{em || "your email"}</span>.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
            <div>
              <p id="otp-label" className="sr-only">
                Verification code
              </p>
              <div
                className="flex justify-center gap-2 sm:gap-3"
                role="group"
                aria-labelledby="otp-label"
                onPaste={handleOtpPaste}
              >
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    placeholder="0"
                    aria-label={`Digit ${i + 1} of 4`}
                    value={otpDigits[i]}
                    onChange={(e) => setOtpAt(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`${inputBase} h-12 w-12 text-center text-lg font-semibold tabular-nums sm:h-14 sm:w-14`}
                  />
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                disabled={resendBusy}
                onClick={handleResend}
                className="font-medium text-[var(--brand-primary)] hover:underline disabled:opacity-50"
              >
                Click to resend
              </button>
            </p>
            {resendHint ? (
              <p className="text-center text-xs text-[var(--text-muted)]">{resendHint}</p>
            ) : null}

            {otpError ? (
              <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
                {otpError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={otpSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
            >
              {otpSubmitting ? "Verifying…" : "Verify & Continue"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            <Link
              href="/temple-admin/signin"
              onClick={goLogin}
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              Back to Login
            </Link>
          </p>
        </div>
        {supportLine}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-xl sm:p-8">
        <div className="mb-8 text-center">
          <OmkaaryaCardMark />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            No worries, we&apos;ll send you reset instructions with a verification code.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSendCode} noValidate>
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
                id={emailFieldId}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="olivia@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} pl-10 pr-4`}
                aria-invalid={!!emailError}
              />
            </div>
          </div>

          {emailError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {emailError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={emailSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
          >
            {emailSubmitting ? "Sending…" : "Send Verification Code"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link
            href="/temple-admin/signin"
            onClick={goLogin}
            className="font-medium text-[var(--brand-primary)] hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
      {supportLine}
    </div>
  );
}
