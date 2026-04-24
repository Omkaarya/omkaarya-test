"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, Plus, X, Loader2, Users2, Shield, Info, Box, ChevronDown, ChevronUp } from "lucide-react";
import { PricingPlanCard, PricingFeature } from "../../../components/ds/molecules/PricingPlanCard";

// ── Types ──────────────────────────────────────────────────────────

type PricingPlan = {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  popular: boolean;
  totalSeats: number;
  roleQuotas: Array<{ roleName: string; count: number }>;
  features: string[];
};

type RegistryFeatureRow = {
  id: number;
  name: string;
  moduleKey: string;
  isActive: boolean;
};

const DEFAULT_TEMPLE_ROLES = ["Temple Admin", "Head Priest", "Priest", "Accountant", "Trustee", "Manager", "Operations Manager", "Counter Staff / POS"];

// ── Page Component ──────────────────────────────────────────────────

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
    totalSeats: "3",
    popular: false,
    selectedRoles: [{ roleName: "Temple Admin", count: 1 }],
    selectedFeatures: [] as string[]
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-plans", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data.map((p: any) => ({
          ...p,
          totalSeats: p.includedSeats || 3,
          roleQuotas: p.roleQuotas || [
            { roleName: "Temple Admin", count: 1 },
            { roleName: "Head Priest", count: 1 },
            { roleName: "Accountant", count: 1 }
          ]
        })));
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
      const j = await res.json();
      const data = Array.isArray(j) ? j : j?.success && Array.isArray(j.data) ? j.data : null;
      if (Array.isArray(data)) {
        setRegistryFeatures(data.filter((f) => f.isActive));
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

  const toggleCardBilling = (planId: string) => {
    setCardBilling((prev) => ({
      ...prev,
      [planId]: (prev[planId] || billing) === "yearly" ? "monthly" : "yearly",
    }));
  };

  const handleRoleCountChange = (index: number, delta: number) => {
    const next = [...formData.selectedRoles];
    const newCount = Math.max(1, (next[index].count || 0) + delta);
    next[index].count = newCount;
    const total = next.reduce((sum, r) => sum + r.count, 0);
    setFormData({ ...formData, selectedRoles: next, totalSeats: String(total) });
  };

  const toggleFeature = (featureName: string) => {
    const next = formData.selectedFeatures.includes(featureName)
      ? formData.selectedFeatures.filter(f => f !== featureName)
      : [...formData.selectedFeatures, featureName];
    setFormData({ ...formData, selectedFeatures: next });
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
        totalSeats: parseInt(formData.totalSeats),
        roleQuotas: formData.selectedRoles,
        popular: formData.popular,
        features: formData.selectedFeatures,
      };

      const res = await fetch("/api/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPlans();
      }
    } catch (e) {
      console.error("Failed to create plan", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group registry features by module for the UI
  const groupedFeatures = registryFeatures.reduce((acc, f) => {
    if (!acc[f.moduleKey]) acc[f.moduleKey] = [];
    acc[f.moduleKey].push(f);
    return acc;
  }, {} as Record<string, RegistryFeatureRow[]>);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" /></div>;

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Pricing & Feature Matrix</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Define temple tiers by combining <span className="text-blue-600">Feature Registry</span> modules with <span className="text-orange-600">Role Quotas</span>.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            <button onClick={() => setBilling("monthly")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${billing === "monthly" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500"}`}>MONTHLY</button>
            <button onClick={() => setBilling("yearly")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${billing === "yearly" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500"}`}>ANNUAL (SAVE 15%)</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Pricing Tier
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all hover:shadow-2xl ${plan.popular ? 'border-[var(--brand-primary)] bg-white dark:bg-zinc-900' : 'border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800'}`}>
            <div className="mb-6">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
               <p className="text-sm text-zinc-500 font-medium mt-1">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
               <span className="text-4xl font-bold text-zinc-900 dark:text-white">₹{((cardBilling[plan.id] || billing) === "yearly" ? plan.priceYearly : plan.priceMonthly) / 100}</span>
               <span className="text-sm font-bold text-zinc-400">/{(cardBilling[plan.id] || billing) === "yearly" ? "year" : "mo"}</span>
            </div>

            <div className="flex-1 space-y-6">
               <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users2 className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">Included Seats: {plan.totalSeats}</span>
                  </div>
                  <div className="space-y-2">
                    {plan.roleQuotas.map((rq, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-medium">
                        <span className="text-zinc-600 dark:text-zinc-400">{rq.roleName}</span>
                        <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold">{rq.count}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Box className="w-3 h-3" /> Included Features ({plan.features.length})
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {plan.features.slice(0, 6).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{f}</span>
                      </div>
                    ))}
                    {plan.features.length > 6 && <span className="text-[10px] text-zinc-400 font-bold ml-6">+ {plan.features.length - 6} more</span>}
                  </div>
               </div>
            </div>

            <Link href={`/super-admin/pricing-plans/${plan.id}/features`} className="mt-8">
               <button className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all">
                 Manage Plan Access
               </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Create Modal (Unified with Roles & Features) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900 p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">New Pricing Tier</h2>
                <p className="text-xs text-zinc-500 font-medium">Configure seats, roles, and feature access.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-8 space-y-8">
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Plan Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold" placeholder="e.g. Sankalpa" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Short Description</label>
                      <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium h-24" placeholder="What makes this plan unique?" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Monthly Price (₹)</label>
                        <input type="number" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Annual Price (₹)</label>
                        <input type="number" required value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 h-12 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                       <input type="checkbox" id="popular-chk" checked={formData.popular} onChange={e => setFormData({...formData, popular: e.target.checked})} className="w-4 h-4 rounded text-[var(--brand-primary)]" />
                       <label htmlFor="popular-chk" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Mark as Most Popular</label>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Section: Roles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                       <Shield className="w-4 h-4 text-orange-500" /> Role Quotas
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-lg">{formData.totalSeats} TOTAL SEATS</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 space-y-3 max-h-[300px] overflow-y-auto">
                    {formData.selectedRoles.map((role, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select 
                          value={role.roleName}
                          onChange={(e) => {
                            const next = [...formData.selectedRoles];
                            next[i].roleName = e.target.value;
                            setFormData({...formData, selectedRoles: next});
                          }}
                          className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white text-xs font-bold"
                        >
                          {DEFAULT_TEMPLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
                           <button type="button" onClick={() => handleRoleCountChange(i, -1)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-900">-</button>
                           <span className="w-6 text-center text-xs font-bold">{role.count}</span>
                           <button type="button" onClick={() => handleRoleCountChange(i, 1)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-900">+</button>
                        </div>
                        <button type="button" onClick={() => {
                          const next = [...formData.selectedRoles];
                          next.splice(i, 1);
                          const total = next.reduce((sum, r) => sum + r.count, 0);
                          setFormData({...formData, selectedRoles: next, totalSeats: String(total)});
                        }} className="p-2 text-zinc-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setFormData({...formData, selectedRoles: [...formData.selectedRoles, { roleName: DEFAULT_TEMPLE_ROLES[0], count: 1 }], totalSeats: String(parseInt(formData.totalSeats) + 1)})} className="w-full py-2.5 border-2 border-dashed border-zinc-200 text-[10px] font-bold text-zinc-400 rounded-xl hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all uppercase">
                       + Add Another Role
                    </button>
                  </div>
                </div>

                {/* Section: Features */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <Box className="w-4 h-4 text-blue-500" /> Feature Registry Access
                  </h3>
                  <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {Object.entries(groupedFeatures).map(([moduleKey, feats]) => (
                      <div key={moduleKey} className="space-y-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">{moduleKey}</p>
                        <div className="grid grid-cols-1 gap-1">
                          {feats.map(feat => (
                            <label key={feat.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${formData.selectedFeatures.includes(feat.name) ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'}`}>
                              <span className="text-xs font-bold">{feat.name}</span>
                              <input type="checkbox" checked={formData.selectedFeatures.includes(feat.name)} onChange={() => toggleFeature(feat.name)} className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {registryFeatures.length === 0 && <p className="text-xs text-zinc-400 text-center py-8">No active features found in registry.</p>}
                  </div>
                </div>

              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 transition-all">Discard</button>
                <button disabled={isSubmitting} type="submit" className="h-12 px-10 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-xl shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Finalize & Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}