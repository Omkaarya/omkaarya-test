"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { SubscriptionRow, type PricingPlanOption } from "./types";

export function ChangePlanModal({
  subscription,
  plans,
  onClose,
  onSave,
}: {
  subscription: SubscriptionRow;
  plans: PricingPlanOption[];
  onClose: () => void;
  onSave: (pricingPlanId: string) => void;
}) {
  const currentPlan = plans.find((p) => p.name === subscription.plan);
  const [selectedId, setSelectedId] = useState(currentPlan?.id ?? plans[0]?.id ?? "");

  useEffect(() => {
    const match = plans.find((p) => p.name === subscription.plan);
    setSelectedId(match?.id ?? plans[0]?.id ?? "");
  }, [subscription.plan, plans]);

  const annual = subscription.billingCycle === "Annual";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Change Subscription Plan</h3>
            <p className="text-sm text-text-tertiary">Update the plan for {subscription.templeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-fg-quaternary transition-colors hover:bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {plans.length === 0 ? (
            <p className="text-sm text-text-tertiary">No pricing plans available. Add plans in Pricing first.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => {
                const isSelected = selectedId === plan.id;
                const isCurrent = subscription.plan === plan.name;
                const priceCents = annual ? plan.priceYearlyCents : plan.priceMonthlyCents;
                const priceLabel = annual
                  ? `${formatUsdFromCents(priceCents)}/yr`
                  : `${formatUsdFromCents(priceCents)}/mo`;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedId(plan.id)}
                    className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-brand bg-brand-50 ring-1 ring-brand"
                        : "border-border bg-surface hover:border-brand-300 hover:bg-subtle"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-text-primary px-2 py-0.5 text-[10px] font-bold text-white">
                        Current
                      </span>
                    )}
                    <p className={`text-sm font-bold ${isSelected ? "text-brand" : "text-text-primary"}`}>
                      {plan.name}
                    </p>
                    <p className="mt-1 text-lg font-black text-text-primary">{priceLabel}</p>
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-text-secondary">
                      <Check className="h-3 w-3 shrink-0 text-brand" />
                      Catalog plan
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
            <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> The temple and subscription records will use the selected catalog plan immediately.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-subtle px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedId || selectedId === currentPlan?.id || plans.length === 0}
            onClick={() => onSave(selectedId)}
          >
            Confirm Plan Change
          </Button>
        </div>
      </div>
    </div>
  );
}
