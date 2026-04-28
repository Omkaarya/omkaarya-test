"use client";

import { CreditCard, ShieldCheck, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { SubscriptionRow } from "./types";

export function ConvertToPaidModal({
  subscription,
  onClose,
  onConfirm,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-0 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand mb-6 shadow-sm">
            <CreditCard className="h-8 w-8" />
          </div>
          
          <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Convert to Paid</h3>
          <p className="mt-2 text-sm text-text-tertiary leading-relaxed">
            Transitioning <span className="font-bold text-text-primary">{subscription.templeName}</span> from their current trial/pending state to a full paid subscription.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-subtle">
              <span className="text-sm font-medium text-text-secondary">Plan Selected</span>
              <span className="text-sm font-bold text-text-primary">{subscription.plan}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-subtle">
              <span className="text-sm font-medium text-text-secondary">Total Amount</span>
              <span className="text-sm font-black text-brand">₹{subscription.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button variant="primary" size="lg" className="w-full" onClick={onConfirm}>
              <ShieldCheck className="h-4 w-4 mr-2" /> Activate Paid Subscription
            </Button>
            <button 
              onClick={onClose}
              className="py-2 text-sm font-bold text-text-tertiary hover:text-text-primary transition-colors"
            >
              Cancel Process
            </button>
          </div>
        </div>
        
        <div className="bg-subtle px-8 py-4 border-t border-border">
          <p className="text-[10px] text-text-tertiary text-center leading-relaxed font-medium">
            By activating, the temple admin will receive an official invoice and their dashboard will be fully unlocked.
          </p>
        </div>
      </div>
    </div>
  );
}
