"use client";

import Link from "next/link";
import { ArrowLeft, FileText, ArrowRight, Info } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

export default function GenerateReceiptPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/temple-admin/finance/donations" className="text-brand hover:text-brand-600 font-medium transition-colors">
          Donations
        </Link>
        <span className="text-text-quaternary">›</span>
        <span>Generate receipt</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Receipts</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Receipt numbers are generated automatically when you record a donation.
          </p>
        </div>
        <Link href="/temple-admin/finance/donations">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary mb-1">Automated receipt numbering</p>
            <p className="text-xs text-text-tertiary leading-relaxed">
              Each donation you record gets a unique <code className="text-[var(--brand-primary)] font-mono">DON-XXXXX</code>{" "}
              receipt number. You can find these on the donations list and reuse them on printed acknowledgements.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30 p-4 flex gap-3 items-start">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            Custom receipt templates (PDF rendering, email delivery, Gift Aid declarations) will hook into your
            <strong> Settings → System → Email </strong>
            configuration. Until then, use the donation list to look up receipt numbers and amounts.
          </p>
        </div>

        <Link
          href="/temple-admin/finance/donations"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
          Open donations <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
