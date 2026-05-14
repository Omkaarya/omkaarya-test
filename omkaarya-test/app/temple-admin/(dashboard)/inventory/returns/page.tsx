"use client";

import Link from "next/link";
import { RotateCcw, ArrowRight, Info } from "lucide-react";

export default function PoojaReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Return from Pooja</h1>
        <p className="text-[12px] text-zinc-500 mt-1">
          Return unused items from a completed pooja back to stock.
        </p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center shrink-0">
          <RotateCcw className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <div className="text-sm font-bold text-purple-900 dark:text-purple-200">Coming with bookings (Phase 3)</div>
          <p className="text-[12px] text-purple-700/80 dark:text-purple-300 mt-1 leading-relaxed">
            Returns will be tied to a specific pooja booking once the booking flow is live. In the meantime, you can
            return items to stock manually using <strong>Stock Adjustments → Returned from pooja</strong> — this
            increments inventory and writes to the stock ledger without creating a financial entry.
          </p>
          <Link
            href="/temple-admin/inventory/adjustments"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            Open Stock Adjustments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
        <span>Income from the original pooja booking is <strong>not reversed</strong>. To refund money, use Finance.</span>
      </div>
    </div>
  );
}
