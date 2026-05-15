"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Shield, User } from "lucide-react";
import type { ApiSuccessBody } from "@/lib/api-envelope";
import { jsonApiErrorMessage } from "@/lib/api-envelope";

type Profile = {
  email: string;
  fullName: string | null;
  roles: string[];
};

function initialsFromProfile(p: Profile | null): string {
  if (!p) return "?";
  const base = (p.fullName || p.email).trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

function formatRoles(roles: string[]): string {
  if (!roles.length) return "—";
  return roles
    .map((r) =>
      String(r)
        .trim()
        .split(/\s+/)
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" ")
    )
    .join(", ");
}

export function AdminAccountPopover() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const fetchStartedRef = useRef(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/super-admin/me", { cache: "no-store" });
      const raw: unknown = await res.json().catch(() => null);
      if (
        raw &&
        typeof raw === "object" &&
        "success" in raw &&
        (raw as { success: boolean }).success === true &&
        "data" in raw
      ) {
        const body = raw as ApiSuccessBody<Profile>;
        setProfile(body.data);
      } else {
        setLoadError(jsonApiErrorMessage(raw) ?? "Could not load profile.");
      }
    } catch {
      setLoadError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    void loadProfile();
  }, [open, loadProfile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const displayName = profile?.fullName?.trim() || profile?.email || "Account";
  const emailLine = profile?.email ?? "";
  const rolesLine = profile ? formatRoles(profile.roles) : null;

  const handleLogout = async () => {
    setLogoutBusy(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      setOpen(false);
      router.push("/super-admin/invite");
    } catch {
      setLogoutBusy(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="super-admin-account-menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[var(--text-muted)] ring-[var(--brand-primary)] transition hover:bg-zinc-300/90 focus-visible:outline-none focus-visible:ring-2 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
        onClick={() => setOpen((o) => !o)}
      >
        <User className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div
          id="super-admin-account-menu"
          role="dialog"
          aria-label="Account"
          className="absolute right-0 top-full z-[100] mt-2 w-[min(100vw-2rem,300px)] min-w-[260px] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-xl dark:border-zinc-700 dark:shadow-black/40"
        >
          <div className="border-b border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-4 dark:border-zinc-700/80">
            {loading && !profile ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-[72%] max-w-[180px] animate-pulse rounded bg-zinc-200 dark:bg-zinc-600" />
                  <div className="h-3 w-[52%] max-w-[140px] animate-pulse rounded bg-zinc-100 dark:bg-zinc-700" />
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)]/90 to-[var(--brand-primary)] text-sm font-bold text-white shadow-inner">
                  {profile ? initialsFromProfile(profile) : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
                  {emailLine ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{emailLine}</p>
                  ) : null}
                  {loadError ? (
                    <p className="mt-2 text-xs text-[var(--color-error-600)] dark:text-[#fd9890]">{loadError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/60">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-primary)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Role</p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-[var(--text-primary)]">
                  {loading && !rolesLine ? "…" : rolesLine ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-default)] p-2 dark:border-zinc-700/80">
            <button
              type="button"
              disabled={logoutBusy}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              onClick={() => void handleLogout()}
            >
              {logoutBusy ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              )}
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
