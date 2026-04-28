"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { SubscriptionRow, PlanName } from "./types";

const PLANS: { name: PlanName; price: string; features: string[] }[] = [
  {
    name: "Prarambha",
    price: "₹24,999/yr",
    features: ["Basic Temple Management", "Up to 5 Users", "Basic Reports"],
  },
  {
    name: "Sankalpa",
    price: "₹14,999/yr",
    features: ["Advanced Inventory", "Up to 15 Users", "Financial Ledger"],
  },
  {
    name: "Aaradhana",
    price: "₹1,999/mo",
    features: ["Unlimited Everything", "Custom Domains", "24/7 Support"],
  },
];

export function ChangePlanModal({
  subscription,
  onClose,
  onSave,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
  onSave: (newPlan: PlanName) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PlanName>(subscription.plan);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-surface p-0 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Change Subscription Plan
            </h3>
            <p className="text-sm text-text-tertiary">
              Update the subscription plan for {subscription.templeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.name;
              const isCurrent = subscription.plan === plan.name;

              return (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`
                    relative flex flex-col items-start p-4 rounded-xl border transition-all text-left
                    ${isSelected 
                      ? "border-brand bg-brand-50 ring-1 ring-brand" 
                      : "border-border bg-surface hover:border-brand-300 hover:bg-subtle"}
                  `}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 -right-2 bg-text-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  <p className={`text-sm font-bold ${isSelected ? "text-brand" : "text-text-primary"}`}>
                    {plan.name}
                  </p>
                  <p className="text-lg font-black text-text-primary mt-1">
                    {plan.price}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-text-secondary leading-tight">
                        <Check className="h-3 w-3 mt-0.5 text-brand shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Note:</strong> Changing the plan will take effect immediately. The current billing cycle will be adjusted, and any price difference will be reflected in the next invoice.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4 bg-subtle">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            disabled={selectedPlan === subscription.plan}
            onClick={() => onSave(selectedPlan)}
          >
            Confirm Plan Change
          </Button>
        </div>
      </div>
    </div>
  );
}
