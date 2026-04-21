"use client";

import { QrCode, Printer } from "lucide-react";

export default function PrintQrPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-[var(--brand-primary)]">
        <QrCode className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Print QR Codes</h1>
      <p className="mt-2 text-sm text-zinc-500 max-w-md">
        Select products from your inventory to generate and print high-quality QR codes for your labels.
      </p>
      <button className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm">
        <Printer className="h-4 w-4" />
        Start Printing
      </button>
    </div>
  );
}
