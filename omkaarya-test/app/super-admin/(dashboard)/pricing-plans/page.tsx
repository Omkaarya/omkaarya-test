"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Check, Plus, Loader2, Users2, Box } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";

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

// ── Page Component ──────────────────────────────────────────────────

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const visGuardRef = useRef<number>(Date.now());

  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-plans", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- API row shape varies; normalized below
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

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    const onVis = () => {
      // Some browsers/environments may fire a visibility event shortly after mount.
      // Avoid an immediate duplicate fetch on initial page load.
      if (Date.now() - visGuardRef.current < 750) return;
      if (document.visibilityState === "visible") {
        void fetchPlans();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [fetchPlans]);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" /></div>;

  return (
    <div className="mx-auto w-full max-w-[min(100rem,calc(100vw-2rem))] space-y-5 animate-in fade-in duration-500">
      <DashboardPageHeader
        title="Pricing plans"
        description="Manage your subscription tiers with fixed seat quotas and role-based seeding."
        actions={
          <>
            <div className="flex rounded-xl bg-zinc-100 p-1 shadow-inner dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  billing === "monthly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500"
                }`}
              >
                MONTHLY
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  billing === "yearly"
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                    : "text-zinc-500"
                }`}
              >
                ANNUAL
              </button>
            </div>
            <Link href="/super-admin/pricing-plans/create">
              <Button variant="primary" size="sm" className="gap-2" leadingIcon={<Plus className="h-4 w-4" />}>
                Create Pricing Tier
              </Button>
            </Link>
          </>
        }
      />

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all hover:shadow-2xl ${plan.popular ? 'border-[var(--brand-primary)] bg-white dark:bg-zinc-900' : 'border-zinc-100 bg-white dark:bg-zinc-900 dark:border-zinc-800'}`}>
            {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg">Most Popular</div>}
            
            <div className="mb-6">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
               <p className="text-sm text-zinc-500 font-medium mt-1 leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8">
               <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold text-zinc-900 dark:text-white">₹{(billing === "yearly" ? plan.priceYearly : plan.priceMonthly) / 100}</span>
                 <span className="text-sm font-bold text-zinc-400">/{billing === "yearly" ? "year" : "mo"}</span>
               </div>
            </div>

            <div className="flex-1 space-y-6">
               <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users2 className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">{plan.totalSeats} TOTAL SEATS</span>
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
                    {plan.features.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{f}</span>
                      </div>
                    ))}
                    {plan.features.length > 5 && <span className="text-[10px] text-zinc-400 font-bold ml-6">+ {plan.features.length - 5} more</span>}
                  </div>
               </div>
            </div>

            <Link href={`/super-admin/pricing-plans/${plan.id}/features`} className="mt-8">
               <button className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all">
                 Configure Tier
               </button>
            </Link>
          </div>
        ))}
        
        {/* Placeholder for "Add New" Card */}
        <Link href="/super-admin/pricing-plans/create" className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-zinc-200 hover:border-[var(--brand-primary)] group transition-all min-h-[400px]">
           <div className="w-16 h-16 rounded-full bg-zinc-50 group-hover:bg-orange-50 flex items-center justify-center mb-4 transition-all">
              <Plus className="w-8 h-8 text-zinc-300 group-hover:text-[var(--brand-primary)]" />
           </div>
           <p className="text-lg font-bold text-zinc-400 group-hover:text-zinc-900 transition-all">Create New Tier</p>
           <p className="text-sm text-zinc-400 mt-1">Add seats, roles, and features</p>
        </Link>
      </div>

    </div>
  );
}