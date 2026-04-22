"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Plus,
  Settings2,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
} from "lucide-react";

type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  popular: boolean;
  includedSeats: number;
  extraSeatPriceMonthly: number;
  features: string[];
};

type FeatureRow = {
  name: string;
  prarambha: boolean;
  sankalpa: boolean;
  aaradhana: boolean;
};

const COMPARISON_FEATURES: FeatureRow[] = [
  { name: "Devotee management", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Pooja booking (online + manual)", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Donations + basic receipts", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Compliance tax receipts", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Temple microsite (subdomain)", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Full microsite + SEO branding", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Panchangam display", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Inventory management", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Standard roles", prarambha: true, sankalpa: true, aaradhana: true },
  { name: "Extended roles (Trustee · Accountant)", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Custom roles", prarambha: false, sankalpa: false, aaradhana: true },
  { name: "Priority support", prarambha: false, sankalpa: true, aaradhana: true },
  { name: "Advanced analytics", prarambha: false, sankalpa: false, aaradhana: true },
  { name: "Custom domain", prarambha: false, sankalpa: false, aaradhana: true },
];

const TEMPLE_ANALYTICS = [
  { plan: "Prarambha", count: 45, pct: 35 },
  { plan: "Sankalpa", count: 62, pct: 48 },
  { plan: "Aaradhana", count: 22, pct: 17 },
];

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [cardBilling, setCardBilling] = useState<Record<string, "monthly" | "yearly">>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceMonthly: "",
    priceYearly: "",
    includedSeats: "",
    extraSeatPriceMonthly: "",
    popular: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const getCardBilling = (planId: string) => cardBilling[planId] || billing;
  const toggleCardBilling = (planId: string) => {
    setCardBilling((prev) => ({
      ...prev,
      [planId]: (prev[planId] || billing) === "yearly" ? "monthly" : "yearly",
    }));
  };

  const togglePlanFeature = async (featureName: string, planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const hasFeature = plan.features.includes(featureName);
    const updatedFeatures = hasFeature 
      ? plan.features.filter(f => f !== featureName)
      : [...plan.features, featureName];

    // Optimistic update
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, features: updatedFeatures } : p));

    try {
      const res = await fetch(`/api/pricing-plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: updatedFeatures }),
      });
      if (!res.ok) throw new Error("Failed to patch");
    } catch (e) {
      // Revert on error
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, features: plan.features } : p));
    }
  };

  const getFeatureValue = (featureName: string, planId: string): boolean => {
    const plan = plans.find(p => p.id === planId);
    return plan?.features.includes(featureName) ?? false;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        priceMonthly: parseInt(formData.priceMonthly) * 100,
        priceYearly: parseInt(formData.priceYearly) * 100,
        includedSeats: parseInt(formData.includedSeats),
        extraSeatPriceMonthly: parseInt(formData.extraSeatPriceMonthly) * 100,
        popular: formData.popular,
        features: [],
      };

      const res = await fetch("/api/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ name: "", description: "", priceMonthly: "", priceYearly: "", includedSeats: "", extraSeatPriceMonthly: "", popular: false });
        fetchPlans();
      }
    } catch (e) {
      console.error("Failed to create plan", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-6">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pricing Plans
              </h1>
              <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                {plans.length} plans
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage and configure your pricing tiers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billing === "monthly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billing === "yearly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Yearly&nbsp;<span className="text-emerald-600 dark:text-emerald-400">Save 15%</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              <Plus className="h-4 w-4" />
              Create Pricing Plan
            </button>
          </div>
        </div>

        {/* ─── Plan Cards ──────────────────────────────────────── */}
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
                  {plan.popular && (
                    <span className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {getCardBilling(plan.id) === "monthly" ? formatPrice(plan.priceMonthly) : formatPrice(plan.priceYearly)}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    /{getCardBilling(plan.id) === "monthly" ? "month" : "year"}
                  </span>
                </div>

                <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Included
                  </h4>
                  <ul className="space-y-1.5">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    onClick={() => toggleCardBilling(plan.id)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      getCardBilling(plan.id) === "yearly"
                        ? "bg-zinc-900 dark:bg-zinc-100"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                        getCardBilling(plan.id) === "yearly" ? "translate-x-4 dark:bg-zinc-900" : "dark:bg-zinc-300"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Billed yearly</span>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
                <Link
                  href={`/super-admin/pricing-plans/${encodeURIComponent(plan.id)}/features`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
                >
                  Manage Features
                </Link>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  Available
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
             <div className="col-span-3 text-center py-12 text-zinc-500">
               No pricing plans available. Click "Create Pricing Plan" to add one.
             </div>
          )}
        </div>
      </div>

      {/* ─── Feature Comparison Table ──────────────────────────── */}
      {plans.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Plan Comparison Matrix</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 w-[40%]">
                    Feature
                  </th>
                  {plans.map(p => (
                    <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {COMPARISON_FEATURES.map((feature) => (
                  <tr key={feature.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {feature.name}
                    </td>
                    {plans.map((plan) => {
                      const enabled = getFeatureValue(feature.name, plan.id);
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePlanFeature(feature.name, plan.id)}
                            className={`inline-flex transition-colors ${
                              enabled
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                            title={enabled ? "Enabled — click to disable" : "Disabled — click to enable"}
                          >
                            {enabled ? (
                              <ToggleRight className="h-6 w-6" />
                            ) : (
                              <ToggleLeft className="h-6 w-6" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Included seats
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {plan.includedSeats}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Extra seat (/mo)
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(plan.extraSeatPriceMonthly)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900 border dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Create Pricing Plan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Plan Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="e.g. Prarambha" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="Plan description" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Monthly Price ($)</label>
                  <input type="number" min="0" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="19" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Yearly Price ($)</label>
                  <input type="number" min="0" required value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="157" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Included Seats</label>
                  <input type="number" min="0" required value={formData.includedSeats} onChange={e => setFormData({...formData, includedSeats: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Extra Seat Price/Mo ($)</label>
                  <input type="number" min="0" required value={formData.extraSeatPriceMonthly} onChange={e => setFormData({...formData, extraSeatPriceMonthly: e.target.value})} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" placeholder="6" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="popular" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} className="rounded text-[var(--brand-primary)]" />
                <label htmlFor="popular" className="text-sm font-medium dark:text-zinc-200">Mark as Most Popular</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-300">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary-hover)] inline-flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
