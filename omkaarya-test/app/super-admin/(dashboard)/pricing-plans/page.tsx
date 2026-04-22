"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, Plus, X, Loader2 } from "lucide-react";

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

type RegistryFeatureRow = {
  id: number;
  name: string;
  moduleKey: string;
};

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [registryFeatures, setRegistryFeatures] = useState<RegistryFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(true);

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

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-plans", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRegistryFeatures = useCallback(async () => {
    setFeaturesLoading(true);
    try {
      const res = await fetch("/api/features", { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as
        | { success?: boolean; data?: Array<{ id: number; name: string; moduleKey: string; isActive: boolean }> }
        | Array<{ id: number; name: string; moduleKey: string; isActive: boolean }>;
      const data = Array.isArray(j) ? j : j?.success && Array.isArray(j.data) ? j.data : null;
      if (Array.isArray(data)) {
        setRegistryFeatures(
          data
            .filter((f) => f.isActive)
            .map((f) => ({ id: f.id, name: f.name, moduleKey: f.moduleKey }))
            .sort((a, b) => {
              const m = a.moduleKey.localeCompare(b.moduleKey);
              if (m !== 0) return m;
              return a.name.localeCompare(b.name);
            })
        );
      }
    } catch (e) {
      console.error("Failed to load feature registry", e);
    } finally {
      setFeaturesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlans();
    void loadRegistryFeatures();
  }, [fetchPlans, loadRegistryFeatures]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        void fetchPlans();
        void loadRegistryFeatures();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [fetchPlans, loadRegistryFeatures]);

  const getCardBilling = (planId: string) => cardBilling[planId] || billing;
  const toggleCardBilling = (planId: string) => {
    setCardBilling((prev) => ({
      ...prev,
      [planId]: (prev[planId] || billing) === "yearly" ? "monthly" : "yearly",
    }));
  };

  const planIncludesFeature = (plan: PricingPlan, featureName: string): boolean =>
    plan.features.includes(featureName);

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
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Rows come from the Feature Registry (active features). To change what a plan includes, use{" "}
              <span className="font-medium">Manage Features</span> on that plan’s card.
            </p>
          </div>

          <div className="overflow-x-auto">
            {featuresLoading && (
              <p className="px-6 py-4 text-sm text-zinc-500">Loading feature list…</p>
            )}
            {!featuresLoading && registryFeatures.length === 0 && (
              <p className="px-6 py-4 text-sm text-zinc-500">
                No active features in the registry. Add features in System Settings → Feature Registry.
              </p>
            )}
            {!featuresLoading && registryFeatures.length > 0 && (
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
                {registryFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="text-[10px] font-medium uppercase text-zinc-400 dark:text-zinc-500 block mb-0.5">
                        {feature.moduleKey}
                      </span>
                      {feature.name}
                    </td>
                    {plans.map((plan) => {
                      const enabled = planIncludesFeature(plan, feature.name);
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center" aria-label={enabled ? "Included" : "Not included"}>
                          {enabled ? (
                            <Check className="inline h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                          ) : (
                            <X className="inline h-5 w-5 text-zinc-300 dark:text-zinc-600" strokeWidth={2} />
                          )}
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
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border dark:border-zinc-800">
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