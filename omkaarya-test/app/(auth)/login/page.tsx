"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { SUPER_ADMIN_REMEMBER_ME_STORAGE_KEY } from "@/lib/super-admin-session-prefs";

const inputBase =
  "w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-all focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 disabled:opacity-60";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(SUPER_ADMIN_REMEMBER_ME_STORAGE_KEY) === "1") {
        setRememberMe(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          localStorage.setItem(SUPER_ADMIN_REMEMBER_ME_STORAGE_KEY, rememberMe ? "1" : "0");
        } catch {
          /* ignore */
        }
        window.location.assign("/super-admin/dashboard");
      } else {
        setError(jsonApiErrorMessage(data) || "Invalid email or password.");
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

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <Image
              src="/brand-logo/Omkaarya 9.svg"
              alt="Omkaarya Logo"
              width={160}
              height={50}
              className="h-12 w-auto invert"
              priority
            />
          </div>
          <div className="mt-4">
            <h1
              className="text-4xl font-bold tracking-tight lg:text-5xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Omkaarya
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/80">Super Admin</p>
            <p className="mt-3 max-w-md text-lg font-medium text-white/90 lg:text-xl">
              Platform administration for temples, subscriptions, and system settings.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form (40%) ── */}
      <div className="flex flex-col items-center justify-center bg-[var(--surface-card)] px-6 py-12 lg:w-[40%] lg:px-12 xl:px-20">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2
              className="mb-2 text-3xl font-bold tracking-tight text-[var(--foreground)]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Super Admin sign-in
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Sign in with your platform administrator email and password.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-[var(--color-border-error)] bg-[var(--color-status-danger-bg)] p-3 text-sm font-medium text-[var(--color-status-danger-text)]"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="block text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
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

            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="super-admin-login-remember"
                className="group flex cursor-pointer items-center gap-2"
              >
                <input
                  id="super-admin-login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm font-medium text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]">
                  Remember me for 30 days
                </span>
              </label>
              {/* <span className="text-sm font-semibold text-[var(--muted)]">Forgot password?</span> */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--surface-card)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* <p className="pt-2 text-center text-xs text-[var(--muted)]">
              Received an invitation with a temporary password?{" "}
              <Link href="/super-admin/invite" className="font-semibold text-[var(--brand-primary)] hover:brightness-95">
                Continue here
              </Link>
              .
            </p> */}
          </form>
        </div>
      </div>
    </div>
  );
}
