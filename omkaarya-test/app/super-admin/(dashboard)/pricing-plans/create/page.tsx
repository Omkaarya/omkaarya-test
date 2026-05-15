"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import GuardedBackLink from "@/app/components/admin/GuardedBackLink";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { formSnapshot } from "@/lib/form-snapshot";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import AffixedInput from "@/app/components/admin/AffixedInput";
import FormField from "@/app/components/admin/FormField";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import SelectInput from "@/app/components/admin/SelectInput";
import TextareaInput from "@/app/components/admin/TextareaInput";
import TextInput from "@/app/components/admin/TextInput";
import { Button } from "@/app/components/ds/atoms/Button";
import {
  Check,
  Plus,
  X,
  Loader2,
  Users2,
  Info,
  Box,
  Save,
  TrendingUp,
  CreditCard,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type RegistryFeatureRow = {
  id: string;
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

const LIST_PATH = "/super-admin/pricing-plans";

const INITIAL_FORM = {
  name: "",
  description: "",
  priceMonthly: "",
  priceYearly: "",
  totalSeats: "3",
  popular: false,
  selectedRoles: [
    { roleName: "Temple Admin", count: 1 },
    { roleName: "Head Priest", count: 1 },
    { roleName: "Accountant", count: 1 },
  ],
  selectedFeatures: [] as string[],
};

// ── Page Component ──────────────────────────────────────────────────

export default function CreatePricingPlanPage() {
  const router = useRouter();
  const [registryFeatures, setRegistryFeatures] = useState<RegistryFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const baselineRef = useRef(formSnapshot(INITIAL_FORM));

  const isDirty = useMemo(() => formSnapshot(formData) !== baselineRef.current, [formData]);
  const postSave = usePostSaveSuccess({ router });
  const formGuard = useUnsavedFormGuard({ isDirty, enabled: !postSave.isLocked });

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const seatCount = Math.max(1, Number.parseInt(formData.totalSeats, 10) || 0);
      const payload = {
        name: formData.name,
        description: formData.description,
        priceMonthly: parseInt(formData.priceMonthly, 10) * 100,
        priceYearly: parseInt(formData.priceYearly, 10) * 100,
        /** Express validates these; align with tier seat total (no per-seat add-on in this UI). */
        includedSeats: seatCount,
        extraSeatPriceMonthly: 0,
        totalSeats: seatCount,
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
        baselineRef.current = formSnapshot(formData);
        formGuard.markClean();
        postSave.triggerSuccess({
          message: "Pricing tier created successfully.",
          redirectTo: LIST_PATH,
        });
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
    <div className="mx-auto max-w-[1200px] space-y-5 pb-20 animate-in fade-in duration-500">
      <DashboardPageHeader
        breadcrumb={
          <>
            <GuardedBackLink
              href={LIST_PATH}
              onNavigate={formGuard.requestNavigate}
              className="font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
            >
              Pricing plans
            </GuardedBackLink>
            <span className="text-text-quaternary">›</span>
            <span>New plan configuration</span>
          </>
        }
        title="Create pricing tier"
        description="Pricing management · Configure seats, roles, and included features for a new subscription tier."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => formGuard.requestNavigate(LIST_PATH)}
              disabled={postSave.isLocked}
            >
              Discard
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="gap-2"
              leadingIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              disabled={isSubmitting || postSave.isLocked}
              onClick={handleSubmit}
            >
              Finalize & Save Tier
            </Button>
          </>
        }
      />

      <PostSaveSuccessBanner text={postSave.bannerText} />

      <fieldset disabled={postSave.isLocked} className="contents min-w-0 border-0 p-0 m-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
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
                <FormField id="plan-name" label="Plan Name" required>
                  <TextInput
                    id="plan-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prarambha"
                  />
                </FormField>
                <FormField id="plan-description" label="Short Description" required>
                  <TextareaInput
                    id="plan-description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what this plan includes..."
                  />
                </FormField>
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
                        <div className="min-w-0 flex-1">
                          <SelectInput
                            aria-label={`Role ${i + 1}`}
                            value={role.roleName}
                            onChange={(e) => {
                              const next = [...formData.selectedRoles];
                              next[i].roleName = e.target.value;
                              setFormData({ ...formData, selectedRoles: next });
                            }}
                            className="border-0 bg-transparent py-1 text-sm font-bold shadow-none focus:ring-0"
                          >
                            {DEFAULT_TEMPLE_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </SelectInput>
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
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField id="plan-price-monthly" label="Monthly Collection (₹)" required>
                      <AffixedInput
                        id="plan-price-monthly"
                        type="number"
                        required
                        min={0}
                        prefix="₹"
                        value={formData.priceMonthly}
                        onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                        placeholder="999"
                      />
                    </FormField>
                    <FormField id="plan-price-yearly" label="Annual Collection (₹)" required>
                      <AffixedInput
                        id="plan-price-yearly"
                        type="number"
                        required
                        min={0}
                        prefix="₹"
                        value={formData.priceYearly}
                        onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                        placeholder="9999"
                      />
                    </FormField>
                 </div>
                 <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setFormData({...formData, popular: !formData.popular})}>
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.popular ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'border-zinc-300 bg-white'}`}>
                          {formData.popular && <Check className="w-3 h-3 text-white" />}
                       </div>
                       <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                         Set as {'"'}Most Popular{'"'} recommendation
                       </span>
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
      </fieldset>

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />
    </div>
  );
}
