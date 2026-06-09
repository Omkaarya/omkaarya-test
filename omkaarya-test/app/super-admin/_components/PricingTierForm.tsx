"use client";

import { Check, CreditCard, Info, Plus, TrendingUp, Users2, X } from "lucide-react";
import AffixedInput from "@/app/components/admin/AffixedInput";
import FormField from "@/app/components/admin/FormField";
import SelectInput from "@/app/components/admin/SelectInput";
import TextareaInput from "@/app/components/admin/TextareaInput";
import TextInput from "@/app/components/admin/TextInput";
import PlanFeatureRow from "@/app/super-admin/_components/PlanFeatureRow";
import { DEFAULT_PRICING_ROLE_QUOTAS, type PricingPlanRoleQuota } from "@/lib/pricing-plan-normalize";

export type RegistryFeatureRow = {
  id: string;
  name: string;
  moduleKey: string;
  isActive: boolean;
};

export type PricingTierFormData = {
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  totalSeats: string;
  popular: boolean;
  selectedRoles: PricingPlanRoleQuota[];
  selectedFeatures: string[];
};

export const DEFAULT_TEMPLE_ROLES = [
  "Temple Admin",
  "Head Priest",
  "Priest",
  "Accountant",
  "Trustee",
  "Manager",
  "Operations Manager",
  "Counter Staff / POS",
];

export const PRICING_TIER_INITIAL_FORM: PricingTierFormData = {
  name: "",
  description: "",
  priceMonthly: "",
  priceYearly: "",
  totalSeats: "3",
  popular: false,
  selectedRoles: DEFAULT_PRICING_ROLE_QUOTAS.map((r) => ({ ...r })),
  selectedFeatures: [],
};

export function pricingTierFormToPayload(formData: PricingTierFormData) {
  const seatCount = Math.max(1, Number.parseInt(formData.totalSeats, 10) || 0);
  return {
    name: formData.name,
    description: formData.description,
    priceMonthly: parseInt(formData.priceMonthly, 10) * 100,
    priceYearly: parseInt(formData.priceYearly, 10) * 100,
    includedSeats: seatCount,
    extraSeatPriceMonthly: 0,
    totalSeats: seatCount,
    roleQuotas: formData.selectedRoles,
    popular: formData.popular,
    features: formData.selectedFeatures,
  };
}

export function pricingTierFormFromApiPlan(p: Record<string, unknown>): PricingTierFormData {
  const roleQuotas = Array.isArray(p.roleQuotas)
    ? (p.roleQuotas as PricingPlanRoleQuota[])
    : DEFAULT_PRICING_ROLE_QUOTAS.map((r) => ({ ...r }));
  const totalSeats = roleQuotas.reduce((s, r) => s + r.count, 0) || 3;
  const features = Array.isArray(p.features)
    ? (p.features as string[]).filter((x): x is string => typeof x === "string")
    : [];

  return {
    name: String(p.name ?? ""),
    description: String(p.description ?? ""),
    priceMonthly: String(Math.round(Number(p.priceMonthly ?? 0) / 100) || ""),
    priceYearly: String(Math.round(Number(p.priceYearly ?? 0) / 100) || ""),
    totalSeats: String(totalSeats),
    popular: Boolean(p.popular),
    selectedRoles: roleQuotas.length > 0 ? roleQuotas : DEFAULT_PRICING_ROLE_QUOTAS.map((r) => ({ ...r })),
    selectedFeatures: features,
  };
}

type PricingTierFormProps = {
  formData: PricingTierFormData;
  onChange: (next: PricingTierFormData) => void;
  registryFeatures: RegistryFeatureRow[];
  showFeatureMatrix?: boolean;
  disabled?: boolean;
};

export default function PricingTierForm({
  formData,
  onChange,
  registryFeatures,
  showFeatureMatrix = true,
  disabled = false,
}: PricingTierFormProps) {
  const handleRoleCountChange = (index: number, delta: number) => {
    const next = [...formData.selectedRoles];
    next[index] = { ...next[index], count: Math.max(1, (next[index]?.count || 0) + delta) };
    const total = next.reduce((sum, r) => sum + r.count, 0);
    onChange({ ...formData, selectedRoles: next, totalSeats: String(total) });
  };

  const toggleFeature = (featureName: string) => {
    const next = formData.selectedFeatures.includes(featureName)
      ? formData.selectedFeatures.filter((f) => f !== featureName)
      : [...formData.selectedFeatures, featureName];
    onChange({ ...formData, selectedFeatures: next });
  };

  const groupedFeatures = registryFeatures.reduce(
    (acc, f) => {
      (acc[f.moduleKey] = acc[f.moduleKey] || []).push(f);
      return acc;
    },
    {} as Record<string, RegistryFeatureRow[]>
  );

  return (
    <div className={`grid grid-cols-1 gap-8 ${showFeatureMatrix ? "lg:grid-cols-3" : ""}`}>
      <div className={`space-y-8 ${showFeatureMatrix ? "lg:col-span-2" : ""}`}>
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">Plan Identity</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <FormField id="plan-name" label="Plan Name" required>
              <TextInput
                id="plan-name"
                required
                disabled={disabled}
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                placeholder="e.g. Prarambha"
              />
            </FormField>
            <FormField id="plan-description" label="Short Description" required>
              <TextareaInput
                id="plan-description"
                required
                disabled={disabled}
                rows={4}
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what this plan includes..."
              />
            </FormField>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/30">
                <Users2 className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
                Role Quotas & Seats
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Seats</span>
              <span className="text-sm font-bold text-[var(--brand-primary)]">{formData.totalSeats} Users</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formData.selectedRoles.map((role, i) => (
              <div
                key={`${role.roleName}-${i}`}
                className="flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:border-zinc-200 dark:border-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <SelectInput
                    aria-label={`Role ${i + 1}`}
                    disabled={disabled}
                    value={role.roleName}
                    onChange={(e) => {
                      const next = [...formData.selectedRoles];
                      next[i] = { ...next[i], roleName: e.target.value };
                      onChange({ ...formData, selectedRoles: next });
                    }}
                    className="border-0 bg-transparent py-1 text-sm font-bold shadow-none focus:ring-0"
                  >
                    {DEFAULT_TEMPLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRoleCountChange(i, -1)}
                    className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-zinc-900"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{role.count}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRoleCountChange(i, 1)}
                    className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-zinc-900"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const next = [...formData.selectedRoles];
                    next.splice(i, 1);
                    const total = next.reduce((sum, r) => sum + r.count, 0);
                    onChange({ ...formData, selectedRoles: next, totalSeats: String(total) });
                  }}
                  className="p-2 text-zinc-300 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  ...formData,
                  selectedRoles: [...formData.selectedRoles, { roleName: DEFAULT_TEMPLE_ROLES[0], count: 1 }],
                  totalSeats: String(parseInt(formData.totalSeats, 10) + 1),
                })
              }
              className="flex min-h-[4.5rem] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 p-4 text-[11px] font-bold uppercase text-zinc-400 transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              <Plus className="h-4 w-4" /> Add Role
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
              Revenue Configuration
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField id="plan-price-monthly" label="Monthly Collection ($)" required>
                <AffixedInput
                  id="plan-price-monthly"
                  type="number"
                  required
                  min={0}
                  disabled={disabled}
                  prefix="$"
                  value={formData.priceMonthly}
                  onChange={(e) => onChange({ ...formData, priceMonthly: e.target.value })}
                  placeholder="99"
                />
              </FormField>
              <FormField id="plan-price-yearly" label="Annual Collection ($)" required>
                <AffixedInput
                  id="plan-price-yearly"
                  type="number"
                  required
                  min={0}
                  disabled={disabled}
                  prefix="$"
                  value={formData.priceYearly}
                  onChange={(e) => onChange({ ...formData, priceYearly: e.target.value })}
                  placeholder="999"
                />
              </FormField>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:bg-zinc-800/50">
              <div
                className={`group flex cursor-pointer items-center gap-3 ${disabled ? "pointer-events-none opacity-60" : ""}`}
                onClick={() => !disabled && onChange({ ...formData, popular: !formData.popular })}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${formData.popular ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-zinc-300 bg-white"}`}
                >
                  {formData.popular ? <Check className="h-3 w-3 text-white" /> : null}
                </div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  Set as &quot;Most Popular&quot; recommendation
                </span>
              </div>
              <div className="mt-2 flex items-start gap-3">
                <Info className="mt-1 h-4 w-4 text-zinc-400" />
                <p className="text-[11px] font-medium leading-relaxed text-zinc-400">
                  Monthly and annual prices are for the total seat quota in this tier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFeatureMatrix ? (
        <div className="space-y-8">
          <div className="sticky top-8 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm scrollbar-thin dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
                  Feature Matrix
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {formData.selectedFeatures.length} FEATURES SELECTED
                </p>
              </div>
            </div>
            <div className="space-y-10">
              {Object.entries(groupedFeatures).map(([moduleKey, feats]) => (
                <div key={moduleKey} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{moduleKey}</span>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        const allSelected = feats.every((f) => formData.selectedFeatures.includes(f.name));
                        let next = [...formData.selectedFeatures];
                        if (allSelected) {
                          next = next.filter((f) => !feats.map((x) => x.name).includes(f));
                        } else {
                          feats.forEach((f) => {
                            if (!next.includes(f.name)) next.push(f.name);
                          });
                        }
                        onChange({ ...formData, selectedFeatures: next });
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:underline"
                    >
                      {feats.every((f) => formData.selectedFeatures.includes(f.name)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {feats.map((feat) => {
                      const selected = formData.selectedFeatures.includes(feat.name);
                      return (
                        <PlanFeatureRow
                          key={feat.id}
                          title={feat.name}
                          className={
                            selected
                              ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
                              : undefined
                          }
                          leading={<span className="sr-only">Select {feat.name}</span>}
                          trailing={
                            <>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600" : "border-zinc-200"}`}
                              >
                                {selected ? <Check className="h-3 w-3 text-white" /> : null}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                disabled={disabled}
                                checked={selected}
                                onChange={() => toggleFeature(feat.name)}
                              />
                            </>
                          }
                          onClick={disabled ? undefined : () => toggleFeature(feat.name)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
