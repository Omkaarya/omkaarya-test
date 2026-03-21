"use client";

import { Mail, Lock, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tempPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to next page (e.g., dashboard)
        router.push("/"); // Change to your desired page
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
      {/* Background rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] rounded-full border border-orange-200/40" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-orange-200/40" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-orange-200/40" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Progress */}
        <div className="flex justify-between text-xs text-gray-400 mb-6">
          <span className="text-orange-500 font-semibold">Accept Invitation</span>
          <span>Set Password</span>
          <span>Temple Profile</span>
          <span>Add socials</span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome to Omkaarya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 psono-formSubmitCatcher-covered" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="olivia@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Temporary Password *</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="********"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
              <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This password was sent to you via email when you were invited.
            </p>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember me
            </label>
            <button type="button" className="text-orange-500 hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : "Verify & Continue"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          Didn’t receive an invitation?{' '}
          <a href="#" className="text-orange-500 hover:underline">
            Contact Us
          </a>
        </div>
      </div>

      {/* Support */}
      <div className="absolute bottom-4 text-xs text-gray-400">
        Need help? Contact Support{' '}
        <span className="text-orange-500">support@omkaarya.com</span>
      </div>
    </div>
  );
}
