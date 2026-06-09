"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ForgotPasswordShellStepper from "@/app/components/temple-admin/ForgotPasswordShellStepper";
import {
  TempleOnboardingStepper,
  templeOnboardingStepFromPathname,
} from "@/app/components/temple-admin/TempleOnboardingStepper";
import {
  loadTempleAdminProfileDraft,
  TEMPLE_ONBOARDING_EMAIL_KEY,
} from "@/lib/temple-onboarding-signin";

function initialsFromFullName(fullName: string | undefined): string {
  const t = fullName?.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  return parts[0]!.slice(0, 2).toUpperCase();
}

function OmkaaryaMark() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className="shrink-0 text-[var(--brand-primary)]"
      aria-hidden
    >
      <circle cx="18" cy="20" r="10" fill="currentColor" opacity="0.2" />
      <path
        d="M18 8c-4 0-7 2.5-7 6 0 2 1.2 3.6 3 4.5V26h8v-7.5c1.8-.9 3-2.5 3-4.5 0-3.5-3-6-7-6z"
        fill="currentColor"
      />
      <path
        d="M14 10c1.2-1.5 2.5-2 4-2s2.8.5 4 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export default function TempleOnboardingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const step = templeOnboardingStepFromPathname(pathname);
  const isForgotPassword = Boolean(pathname?.includes("/temple-admin/forgot-password"));
  const isCompletePage = Boolean(pathname?.includes("/temple-admin/onboarding-complete"));
  const [avatarInitials, setAvatarInitials] = useState("?");
  const [avatarTitle, setAvatarTitle] = useState("Temple admin");

  useEffect(() => {
    if (!isCompletePage) return;
    const draft = loadTempleAdminProfileDraft();
    const name = draft?.fullName?.trim();
    const fromName = initialsFromFullName(name);
    if (fromName) setAvatarInitials(fromName);
    else {
      const email = sessionStorage.getItem(TEMPLE_ONBOARDING_EMAIL_KEY);
      setAvatarInitials(email?.trim()?.[0]?.toUpperCase() ?? "?");
    }
    setAvatarTitle(name || "Temple admin");
  }, [isCompletePage, pathname]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-orange-50/90 via-[#fffbf7] to-white dark:from-[var(--surface-page)] dark:via-[var(--surface-card)] dark:to-[var(--surface-page)]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[min(700px,120vw)] w-[min(700px,120vw)] rounded-full border border-orange-200/35 dark:border-[var(--brand-primary)]/15" />
        <div className="absolute h-[min(500px,90vw)] w-[min(500px,90vw)] rounded-full border border-orange-200/35 dark:border-[var(--brand-primary)]/15" />
        <div className="absolute h-[min(300px,70vw)] w-[min(300px,70vw)] rounded-full border border-orange-200/35 dark:border-[var(--brand-primary)]/15" />
      </div>

      <header className="relative z-10 border-b border-orange-100/60 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-[var(--border-default)] dark:bg-[var(--surface-card)]/80 sm:px-6 lg:px-10">
        <div
          className={[
            "mx-auto flex max-w-6xl items-center gap-3",
            isCompletePage
              ? "flex-row justify-between"
              : "flex-col self-stretch lg:flex-row lg:justify-between lg:gap-6",
          ].join(" ")}
        >
          <Link
            href="/temple-admin/signin"
            className={[
              "flex shrink-0 items-center",
              isCompletePage ? "" : "self-start lg:self-center",
            ].join(" ")}
          >
            <Image
              src="/brand-logo/Omkaarya 5.svg"
              alt="Omkaarya"
              width={140}
              height={32}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          {!isCompletePage ? (
            <div className="order-last min-w-0 w-full flex-1 lg:order-none lg:max-w-2xl lg:flex-[1.25]">
              {isForgotPassword ? (
                <Suspense
                  fallback={
                    <div
                      className="h-14 w-full animate-pulse rounded-lg bg-orange-100/40 dark:bg-zinc-800/50"
                      aria-hidden
                    />
                  }
                >
                  <ForgotPasswordShellStepper />
                </Suspense>
              ) : (
                <TempleOnboardingStepper currentStep={step} />
              )}
            </div>
          ) : null}

          <div
            className={[
              "flex shrink-0 items-center gap-3",
              isCompletePage ? "" : "justify-end self-end lg:self-center",
            ].join(" ")}
          >
            {/* <a
              href="mailto:support@omkaarya.com?subject=Temple%20admin%20onboarding"
              className="rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Contact Us
            </a> */}
            {isCompletePage ? (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-orange-100 to-amber-50 text-xs font-bold text-[var(--brand-primary)] dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-700 dark:text-orange-300"
                title={avatarTitle}
                role="img"
                aria-label={`Signed in as ${avatarTitle}`}
              >
                {avatarInitials}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-8 lg:px-8">
        {children}
      </main>

      <footer className="relative mt-auto border-t border-orange-100/60 bg-white/60 px-4 py-5 text-[11px] text-[var(--text-muted)] backdrop-blur-sm dark:border-[var(--border-default)] dark:bg-[var(--surface-card)]/70 sm:px-6 sm:text-xs lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-4">
          <p className="text-center sm:text-left">2024 - 2026 © Om Kaaryaa All Right Reserved</p>
          <p className="text-center">Powered By Pepulux All Right Reserved</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1" aria-label="Footer">
            <a href="#" className="text-[var(--brand-primary)] hover:underline">
              Terms
            </a>
            <a href="#" className="text-[var(--brand-primary)] hover:underline">
              Privacy
            </a>
            <a href="#" className="text-[var(--brand-primary)] hover:underline">
              Help
            </a>
            <a href="#" className="text-[var(--brand-primary)] hover:underline">
              Status
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
