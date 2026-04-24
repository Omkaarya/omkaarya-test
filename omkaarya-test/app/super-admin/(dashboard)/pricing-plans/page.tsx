"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, Plus, X, Loader2, Users2, Shield, Info } from "lucide-react";
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
    selectedRoles: [{ roleName: "Temple Admin", count: 1 }]
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-plans", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        // Mocking the new data structure for now until API is updated
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
        setRegistryFeatures(
          data.filter((f) => f.isActive).map((f) => ({ id: f.id, name: f.name, moduleKey: f.moduleKey }))
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
    
    // Update total seats based on sum of roles
    const total = next.reduce((sum, r) => sum + r.count, 0);
    setFormData({ ...formData, selectedRoles: next, totalSeats: String(total) });
  };

  const addRoleToPlan = () => {
    setFormData({
      ...formData,
      selectedRoles: [...formData.selectedRoles, { roleName: DEFAULT_TEMPLE_ROLES[0], count: 1 }],
      totalSeats: String(parseInt(formData.totalSeats) + 1)
    });
  };

  const removeRoleFromPlan = (index: number) => {
    const next = [...formData.selectedRoles];
    const removedCount = next[index].count;
    next.splice(index, 1);
    setFormData({
      ...formData,
      selectedRoles: next,
      totalSeats: String(parseInt(formData.totalSeats) - removedCount)
    });
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
        fetchPlans();
      }
    } catch (e) {
      console.error("Failed to create plan", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" /></div>;

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Pricing Architecture</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-lg">
            Configure temple subscription tiers based on fixed seat quotas and included roles. 
            <span className="text-emerald-600 block mt-1">Per-user extra charging is disabled.</span>
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
            {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">Most Popular</div>}
            
            <div className="mb-8">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
               <p className="text-sm text-zinc-500 font-medium mt-1">{plan.description}</p>
            </div>

            <div className="mb-8">
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold text-zinc-900 dark:text-white">₹{((cardBilling[plan.id] || billing) === "yearly" ? plan.priceYearly : plan.priceMonthly) / 100}</span>
                 <span className="text-sm font-bold text-zinc-400">/{(cardBilling[plan.id] || billing) === "yearly" ? "year" : "mo"}</span>
               </div>
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
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Key Features</p>
                  {registryFeatures.slice(0, 5).map(f => (
                    <div key={f.id} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{f.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            <Link href={`/super-admin/pricing-plans/${plan.id}/features`} className="mt-8">
               <button className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all">
                 Configure Features
               </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Create Pricing Tier</h2>
                  <p className="text-xs text-zinc-500 font-medium">Define seat limits and role quotas for this plan.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Plan Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold focus:border-[var(--brand-primary)] outline-none" placeholder="e.g. Prarambha" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Total Seats (Auto)</label>
                    <div className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center text-sm font-bold text-zinc-900 dark:text-white">
                      <Users2 className="w-4 h-4 mr-2 text-[var(--brand-primary)]" /> {formData.totalSeats} Users
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                   <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Role Quota Configuration</label>
                      <button type="button" onClick={addRoleToPlan} className="text-[10px] font-bold text-[var(--brand-primary)] uppercase hover:underline">+ Add Role</button>
                   </div>
                   <div className="space-y-3">
                      {formData.selectedRoles.map((role, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <select 
                            value={role.roleName}
                            onChange={(e) => {
                              const next = [...formData.selectedRoles];
                              next[i].roleName = e.target.value;
                              setFormData({...formData, selectedRoles: next});
                            }}
                            className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold"
                          >
                            {DEFAULT_TEMPLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <div className="flex items-center gap-2">
                             <button type="button" onClick={() => handleRoleCountChange(i, -1)} className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 hover:text-zinc-900">-</button>
                             <span className="w-8 text-center text-xs font-bold">{role.count}</span>
                             <button type="button" onClick={() => handleRoleCountChange(i, 1)} className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 hover:text-zinc-900">+</button>
                          </div>
                          <button type="button" onClick={() => removeRoleFromPlan(i)} className="p-2 text-zinc-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Monthly Price (₹)</label>
                    <input type="number" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Annual Price (₹)</label>
                    <input type="number" required value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold" placeholder="9999" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="h-12 px-6 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 transition-all">Cancel</button>
                  <button disabled={isSubmitting} type="submit" className="h-12 px-8 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Pricing Tier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}