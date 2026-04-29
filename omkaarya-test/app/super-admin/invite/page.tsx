"use client";

import { Mail, Lock, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

const inputBase =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";

export default function InvitationLogin() {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError("Email is required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError("Enter a valid email address.");
        return;
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, tempPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
      } else {
        setError(jsonApiErrorMessage(data) || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-[var(--surface-page)] dark:to-[var(--surface-card)]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[700px] w-[700px] rounded-full border border-orange-200/40 dark:border-[var(--brand-primary)]/20" />
        <div className="absolute h-[500px] w-[500px] rounded-full border border-orange-200/40 dark:border-[var(--brand-primary)]/20" />
        <div className="absolute h-[300px] w-[300px] rounded-full border border-orange-200/40 dark:border-[var(--brand-primary)]/20" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8 shadow-xl">
        <div className="mb-6 flex justify-between text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--brand-primary)]">Accept Invitation</span>
          <span>Set Password</span>
          <span>Temple Profile</span>
          <span>Add socials</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Welcome to Omkaarya</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-4 psono-formSubmitCatcher-covered" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Email *</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                placeholder="olivia@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} pl-10 pr-4`}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">Temporary Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="password"
                placeholder="********"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className={`${inputBase} pl-10 pr-10`}
                required
              />
              <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-[var(--text-muted)]" />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              This password was sent to you via email when you were invited.
            </p>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--text-muted)]">
              <input
                type="checkbox"
                className="rounded border-[var(--border-default)] bg-[var(--surface-elevated)]"
              />
              Remember me
            </label>
            <button type="button" className="text-[var(--brand-primary)] hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] py-2.5 font-medium text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Didn’t receive an invitation?{" "}
          <a href="#" className="text-[var(--brand-primary)] hover:underline">
            Contact Us
          </a>
        </div>
      </div>

      <div className="absolute bottom-4 text-xs text-[var(--text-muted)]">
        Need help? Contact Support{" "}
        <span className="text-[var(--brand-primary)]">support@omkaarya.com</span>
      </div>
    </div>
  );
}
