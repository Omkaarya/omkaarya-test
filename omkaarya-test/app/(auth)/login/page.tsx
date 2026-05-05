"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/super-admin/dashboard");
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans">
      {/* ── Left Side Branding (60%) ── */}
      <div className="flex flex-col justify-center items-center lg:w-[60%] bg-[var(--brand-primary)] p-10 text-white min-h-[350px] lg:min-h-screen relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-black blur-[100px]" />
        </div>

        <div className="flex flex-col items-center gap-6 text-center relative z-10">
          <div className="flex items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <Image
              src="/brand-logo/Omkaarya 9.svg"
              alt="Omkaarya Logo"
              width={160}
              height={50}
              className="w-auto h-12 invert"
              priority
            />
          </div>
          <div className="mt-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Om Kaaryaa
            </h1>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80 mt-2">Super Admin</p>
            <p className="text-lg lg:text-xl font-medium text-white/90 max-w-md mt-3">
              Platform administration for temples, subscriptions, and system settings.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side Form (40%) ── */}
      <div className="flex flex-col justify-center items-center lg:w-[40%] px-6 py-12 lg:px-12 xl:px-20 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Super Admin sign-in
            </h2>
            <p className="text-gray-500 text-sm">Sign in with your platform administrator email and password.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember for 30 days
                </span>
              </label>
              <span className="text-sm font-semibold text-gray-400">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-3 mt-4 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:brightness-110 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 transition-all active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              Received an invitation with a temporary password?{" "}
              <Link href="/super-admin/invite" className="font-semibold text-[var(--brand-primary)] hover:brightness-95">
                Continue here
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
