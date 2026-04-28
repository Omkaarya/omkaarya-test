"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  Users2, 
  Shield, 
  Info, 
  Box, 
  Save,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Settings
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type RegistryFeatureRow = {
  id: number;
  name: string;
  moduleKey: string;
  isActive: boolean;
};

const DEFAULT_TEMPLE_ROLES = [
  "Temple Admin", 
  "Head Priest", 
  "Priest", 
  "Accountant", 
  "Trustee", 
  "Manager", 
  "Operations Manager", 
  "Counter Staff / POS"
];

// ── Page Component ──────────────────────────────────────────────────

export default function CreatePricingPlanPage() {
  const router = useRouter();
  const [registryFeatures, setRegistryFeatures] = useState<RegistryFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceMonthly: "",
    priceYearly: "",
    totalSeats: "3",
    popular: false,
    selectedRoles: [{ roleName: "Temple Admin", count: 1 }, { roleName: "Head Priest", count: 1 }, { roleName: "Accountant", count: 1 }],
    selectedFeatures: [] as string[]
  });

  const loadRegistryFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/features", { cache: "no-store" });
      const j = await res.json();
      const data = Array.isArray(j) ? j : j?.success && Array.isArray(j.data) ? j.data : null;
      if (Array.isArray(data)) {
        setRegistryFeatures(data.filter((f) => f.isActive));
      }
    } catch (e) {
      console.error("Failed to load feature registry", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRegistryFeatures(); }, [loadRegistryFeatures]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        router.push("/super-admin/pricing-plans");
      }
    } catch (e) {
      console.error("Failed to create plan", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedFeatures = registryFeatures.reduce((acc, f) => {
    if (!acc[f.moduleKey]) acc[f.moduleKey] = [];
    acc[f.moduleKey].push(f);
    return acc;
  }, {} as Record<string, RegistryFeatureRow[]>);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/pricing-plans" className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-[var(--brand-primary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Create Pricing Tier</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-zinc-500">Pricing Management</span>
              <ChevronRight className="w-3 h-3 text-zinc-300" />
              <span className="text-xs font-bold text-[var(--brand-primary)]">New Plan Configuration</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/super-admin/pricing-plans" className="h-11 px-6 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all">
            Discard
          </Link>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-11 px-8 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-xl shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Finalize & Save Tier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Plan Details & Pricing */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Section 1: Identity */}
           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                 <CreditCard className="w-5 h-5 text-blue-600" />
               </div>
               <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Plan Identity</h3>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest px-1">Plan Name</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full h-14 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-base font-bold focus:border-[var(--brand-primary)] outline-none transition-all shadow-sm" 
                    placeholder="e.g. Prarambha" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest px-1">Short Description</label>
                  <textarea 
                    required 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium h-24 focus:border-[var(--brand-primary)] outline-none shadow-sm" 
                    placeholder="Briefly describe what this plan includes..." 
                  />
                </div>
             </div>
           </div>

           {/* Section 2: Role Quotas */}
           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                     <Users2 className="w-5 h-5 text-orange-600" />
                   </div>
                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Role Quotas & Seats</h3>
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Seats</span>
                    <span className="text-sm font-bold text-[var(--brand-primary)]">{formData.totalSeats} Users</span>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {formData.selectedRoles.map((role, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 hover:border-zinc-200 transition-all">
                        <div className="flex-1">
                           <select 
                            value={role.roleName}
                            onChange={(e) => {
                              const next = [...formData.selectedRoles];
                              next[i].roleName = e.target.value;
                              setFormData({...formData, selectedRoles: next});
                            }}
                            className="w-full h-8 bg-transparent text-sm font-bold outline-none cursor-pointer"
                          >
                            {DEFAULT_TEMPLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700">
                           <button type="button" onClick={() => handleRoleCountChange(i, -1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900">-</button>
                           <span className="w-6 text-center text-xs font-bold">{role.count}</span>
                           <button type="button" onClick={() => handleRoleCountChange(i, 1)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900">+</button>
                        </div>
                        <button type="button" onClick={() => {
                          const next = [...formData.selectedRoles];
                          next.splice(i, 1);
                          const total = next.reduce((sum, r) => sum + r.count, 0);
                          setFormData({...formData, selectedRoles: next, totalSeats: String(total)});
                        }} className="p-2 text-zinc-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                     </div>
                   ))}
                   <button type="button" onClick={() => setFormData({...formData, selectedRoles: [...formData.selectedRoles, { roleName: DEFAULT_TEMPLE_ROLES[0], count: 1 }], totalSeats: String(parseInt(formData.totalSeats) + 1)})} className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-zinc-200 text-[11px] font-bold text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all uppercase">
                      <Plus className="w-4 h-4" /> Add Role
                   </button>
                 </div>
              </div>
           </div>

           {/* Section 3: Financials */}
           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Revenue Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Monthly Collection (₹)</label>
                      <input type="number" required value={formData.priceMonthly} onChange={e => setFormData({...formData, priceMonthly: e.target.value})} className="w-full h-14 px-5 rounded-2xl border border-zinc-200 bg-zinc-50 text-lg font-bold" placeholder="999" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Annual Collection (₹)</label>
                      <input type="number" required value={formData.priceYearly} onChange={e => setFormData({...formData, priceYearly: e.target.value})} className="w-full h-14 px-5 rounded-2xl border border-zinc-200 bg-zinc-50 text-lg font-bold" placeholder="9999" />
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setFormData({...formData, popular: !formData.popular})}>
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.popular ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-zinc-300 bg-white'}`}>
                          {formData.popular && <Check className="w-3 h-3 text-white" />}
                       </div>
                       <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Set as "Most Popular" Recommendation</span>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                       <Info className="w-4 h-4 text-zinc-400 mt-1" />
                       <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Monthly and annual prices are strictly for the total seat quota. Extra user charges are no longer applicable as per the new tier-based architecture.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Feature Selection Matrix */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm h-full sticky top-8 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Box className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Feature Matrix</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formData.selectedFeatures.length} FEATURES SELECTED</p>
                </div>
              </div>

              <div className="space-y-10">
                {Object.entries(groupedFeatures).map(([moduleKey, feats]) => (
                  <div key={moduleKey} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{moduleKey}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const allSelected = feats.every(f => formData.selectedFeatures.includes(f.name));
                          let next = [...formData.selectedFeatures];
                          if (allSelected) {
                            next = next.filter(f => !feats.map(x => x.name).includes(f));
                          } else {
                            feats.forEach(f => { if (!next.includes(f.name)) next.push(f.name); });
                          }
                          setFormData({...formData, selectedFeatures: next});
                        }}
                        className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider hover:underline"
                      >
                         {feats.every(f => formData.selectedFeatures.includes(f.name)) ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {feats.map(feat => (
                        <label 
                          key={feat.id} 
                          className={`
                            group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer
                            ${formData.selectedFeatures.includes(feat.name) 
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                              : 'bg-white border-zinc-100 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700'}
                          `}
                        >
                          <span className={`text-xs font-bold ${formData.selectedFeatures.includes(feat.name) ? 'text-blue-900 dark:text-blue-200' : 'text-zinc-500'}`}>{feat.name}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.selectedFeatures.includes(feat.name) ? 'bg-blue-600 border-blue-600' : 'border-zinc-200'}`}>
                            {formData.selectedFeatures.includes(feat.name) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.selectedFeatures.includes(feat.name)} onChange={() => toggleFeature(feat.name)} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
