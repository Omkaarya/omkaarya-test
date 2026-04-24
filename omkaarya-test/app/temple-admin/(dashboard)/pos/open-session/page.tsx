"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Monitor, ArrowLeft, KeyRound } from "lucide-react";

// ── Mock Data (would come from /api/pos/registers) ────────────────

const MOCK_REGISTERS = [
  { id: "reg-001", name: "Main Counter", code: "TMP-REG-001", counterType: "Prasadam", isActive: true },
  { id: "reg-002", name: "Ticket Counter", code: "TMP-REG-002", counterType: "Tickets", isActive: true },
  { id: "reg-003", name: "Backup Register", code: "TMP-REG-003", counterType: "General Store", isActive: false },
];

// ── Component ──────────────────────────────────────────────────────

export default function OpenSessionPage() {
  const router = useRouter();
  const [selectedRegister, setSelectedRegister] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [staffPin, setStaffPin] = useState("");
  const [loading, setLoading] = useState(false);

  const activeRegisters = MOCK_REGISTERS.filter((r) => r.isActive);
  const selected = MOCK_REGISTERS.find((r) => r.id === selectedRegister);

  const handleOpenSession = () => {
    if (!selectedRegister || !openingBalance) return;
    setLoading(true);
    // Simulate API call to create session
    setTimeout(() => {
      router.push("/temple-admin/pos/terminal");
    }, 800);
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center mb-5 shadow-lg">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Open POS Session
            </h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Select a register and enter the opening balance.
            </p>
          </div>

          {/* Card Body */}
          <div className="px-8 pb-8 space-y-5">
            {/* Register Dropdown */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                Register <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRegister}
                onChange={(e) => setSelectedRegister(e.target.value)}
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 transition-colors appearance-none"
              >
                <option value="">Select register...</option>
                {activeRegisters.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name} ({reg.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Counter Type (auto-filled) */}
            {selected && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  Counter Type
                </label>
                <div className="mt-1.5 w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-[var(--text-tertiary)] flex items-center dark:border-zinc-800 dark:bg-zinc-950">
                  {selected.counterType}
                </div>
              </div>
            )}

            {/* Opening Cash Balance */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                Opening Cash Balance <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-tertiary)] font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full h-11 pl-8 pr-4 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 transition-colors"
                />
              </div>
            </div>

            {/* Staff PIN (Optional) */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                Staff PIN
                <span className="text-[10px] text-[var(--text-tertiary)] font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="password"
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="mt-1.5 w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 transition-colors tracking-[0.4em] text-center"
              />
            </div>

            {/* Open Session Button */}
            <button
              onClick={handleOpenSession}
              disabled={!selectedRegister || !openingBalance || loading}
              className="w-full h-12 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Monitor className="w-4 h-4" />
                  Open Session
                </>
              )}
            </button>

            {/* Back Link */}
            <Link
              href="/temple-admin/pos"
              className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--foreground)] transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
