"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

/**
 * FeatureGate — Wraps content that requires a specific feature to be enabled.
 *
 * If the feature is disabled, shows an "Upgrade required" message instead
 * of the children content. Used for route protection and section gating.
 *
 * Usage:
 * ```tsx
 * <FeatureGate featureKey="pooja_management" enabled={access.enabled}>
 *   <PoojaManagementPage />
 * </FeatureGate>
 * ```
 */
export default function FeatureGate({
  featureKey,
  featureName,
  enabled,
  children,
}: {
  featureKey: string;
  featureName?: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (enabled) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        {/* Lock Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <Lock className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Upgrade Required
        </h2>

        {/* Description */}
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          {featureName ? (
            <>
              <strong>{featureName}</strong> is not included in your current plan.
            </>
          ) : (
            <>This feature is not available on your current plan.</>
          )}{" "}
          Please contact your administrator or upgrade your subscription to access this module.
        </p>

        {/* Feature key for debugging */}
        <p className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">
          Feature: <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-zinc-800">{featureKey}</code>
        </p>

        {/* Action */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/temple-admin"
            className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            className="rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
            onClick={() => {
              // In a real implementation, this would navigate to billing/upgrade page
              window.alert("Please contact your temple administrator to upgrade your plan.");
            }}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * LimitReachedBanner — Shows a warning when a feature limit is reached.
 *
 * Usage:
 * ```tsx
 * {limitReached && <LimitReachedBanner featureName="Devices" limit={2} current={2} />}
 * ```
 */
export function LimitReachedBanner({
  featureName,
  limit,
  current,
}: {
  featureName: string;
  limit: number;
  current: number;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {featureName} limit reached
        </p>
        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
          You've used {current} of {limit} allowed {featureName.toLowerCase()}. Upgrade your plan
          for higher limits.
        </p>
      </div>
    </div>
  );
}
