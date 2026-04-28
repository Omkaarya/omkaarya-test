"use client";

import { useState } from "react";
import { Calendar, RefreshCw, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { SubscriptionRow } from "./types";
import { formatDate } from "./utils";

export function ExtendModal({
  subscription,
  onClose,
  onSave,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
  onSave: (extensionMonths: number) => void;
}) {
  const [months, setMonths] = useState(12);

  const newExpiryDate = new Date(subscription.expiresOn);
  newExpiryDate.setMonth(newExpiryDate.getMonth() + months);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Extend Subscription
            </h3>
            <p className="text-sm text-text-tertiary">
              Renew subscription for {subscription.templeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 rounded-xl bg-subtle p-4 border border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Current Expiry</p>
              <p className="text-sm font-bold text-text-primary">{formatDate(subscription.expiresOn)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-3">Extension Period</label>
            <div className="grid grid-cols-2 gap-3">
              {[6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`
                    px-4 py-3 rounded-xl border text-sm font-bold transition-all
                    ${months === m 
                      ? "border-brand bg-brand-50 text-brand ring-1 ring-brand" 
                      : "border-border bg-surface text-text-secondary hover:bg-subtle"}
                  `}
                >
                  {m === 12 ? "1 Year (12 Months)" : m === 24 ? "2 Years (24 Months)" : `${m} Months`}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border p-4 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-tertiary">New Expiry Date</span>
              <span className="text-sm font-black text-brand uppercase tracking-tight">{formatDate(newExpiryDate.toISOString())}</span>
            </div>
            <p className="text-[11px] text-text-tertiary leading-relaxed italic">
              Extension will be added to the current expiry date. An invoice for the renewal amount will be generated automatically.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4 bg-subtle">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => onSave(months)}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Confirm Extension
          </Button>
        </div>
      </div>
    </div>
  );
}
