"use client";

import { useEffect, useState, useId, useRef } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputBase =
  "w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 disabled:opacity-60";

export default function UnifiedLoginPage() {
  const emailId = useId();
  const passwordId = useId();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/temple-admin/me", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.ok) {
          window.location.replace("/temple-admin");
          return;
        }
      } catch {
        /* not a temple admin */
      }
      try {
        const res = await fetch("/api/super-admin/me", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.ok) {
          window.location.replace("/super-admin/dashboard");
          return;
        }
      } catch {
        /* not authenticated */
      }
    };
    void check();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void check();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: password.trim() }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        data?: { firstLogin?: boolean; tenantId?: string | null };
        error?: string | { message?: string };
        message?: string;
      } | null;

      if (response.ok) {
        const tenantId =
          data && typeof data === "object" && "data" in data && data.data
            ? data.data.tenantId
            : null;

        if (tenantId) {
          window.location.replace("/temple-admin");
        } else {
          window.location.replace("/super-admin/dashboard");
        }
        return;
      }

      if (response.status === 401) {
        setError("Invalid email or password.");
      } else if (response.status === 403) {
        setError(
          jsonApiErrorMessage(data) ||
            "Your account access has been restricted. Please contact support."
        );
      } else {
        setError(jsonApiErrorMessage(data) || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-page)] font-sans lg:flex-row">
      {/* ── Left Side Branding (60%) ── */}
      <div className="relative flex min-h-[350px] flex-col items-center justify-center overflow-hidden bg-[var(--brand-primary)] p-10 text-white lg:min-h-screen lg:w-[60%]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden opacity-20">
          <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-white blur-[100px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-black blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand-logo/Omkaarya 9.svg"
            alt="Omkaarya Logo"
            width={655}
            height={162}
            className="h-auto w-full max-w-xs sm:max-w-sm"
            priority
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Omkaarya Platform
            </p>
            <p className="mt-3 max-w-md text-lg font-medium text-white/90 lg:text-xl">
              Temple management, administration, and digital services.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form (40%) ── */}
      <div className="flex flex-col items-center justify-center bg-[var(--surface-card)] px-6 py-12 lg:w-[40%] lg:px-12 xl:px-20">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h2
              className="mb-2 text-3xl font-bold tracking-tight text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-jakarta-sans), sans-serif" }}
            >
              Sign in
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[var(--color-border-error)] bg-[var(--color-status-danger-bg)] p-3 text-sm font-medium text-[var(--color-status-danger-text)]"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor={emailId}
                className="block text-sm font-medium text-[var(--foreground)]"
              >
                Email
              </label>
              <input
                ref={emailRef}
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className={inputBase}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={passwordId}
                className="block text-sm font-medium text-[var(--foreground)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--surface-card)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-[var(--muted)] leading-relaxed">
            This system is restricted to authorized operators.
            <br />
            Session operations and IP logs are tracked.
          </p>
        </div>
      </div>
    </div>
  );
}
