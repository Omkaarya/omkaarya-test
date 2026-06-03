"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import GuardedBackLink from "@/app/components/admin/GuardedBackLink";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { formSnapshot } from "@/lib/form-snapshot";
import { usePostSaveSuccess } from "@/lib/use-post-save-success";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import { Button } from "@/app/components/ds/atoms/Button";
import { Loader2, Save } from "lucide-react";
import PricingTierForm, {
  PRICING_TIER_INITIAL_FORM,
  type PricingTierFormData,
  type RegistryFeatureRow,
  pricingTierFormToPayload,
} from "@/app/super-admin/_components/PricingTierForm";

const LIST_PATH = "/super-admin/pricing-plans";

export default function CreatePricingPlanPage() {
  const router = useRouter();
  const [registryFeatures, setRegistryFeatures] = useState<RegistryFeatureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PricingTierFormData>(PRICING_TIER_INITIAL_FORM);
  const baselineRef = useRef(formSnapshot(PRICING_TIER_INITIAL_FORM));

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

  useEffect(() => {
    void loadRegistryFeatures();
  }, [loadRegistryFeatures]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingTierFormToPayload(formData)),
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] animate-in space-y-5 pb-20 duration-500 fade-in">
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

      <fieldset disabled={postSave.isLocked} className="contents m-0 min-w-0 border-0 p-0">
        <PricingTierForm
          formData={formData}
          onChange={setFormData}
          registryFeatures={registryFeatures}
        />
      </fieldset>

      <UnsavedChangesDialog
        dialogRef={formGuard.dialogRef}
        onStay={formGuard.closeDialog}
        onLeave={formGuard.confirmLeave}
      />
    </div>
  );
}
