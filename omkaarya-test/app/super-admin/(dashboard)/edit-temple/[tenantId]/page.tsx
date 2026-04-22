"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import TempleWizard from "../../_components/TempleWizard";
import type { SuperAdminTempleDetail } from "@/lib/super-admin-temple-detail";

export default function EditTemplePage() {
  const params = useParams();
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : "";
  const [detail, setDetail] = useState<SuperAdminTempleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setError("Missing temple id");
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/temples/${encodeURIComponent(tenantId)}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        const data: unknown = await res.json();
        if (!res.ok) {
          const msg =
            data && typeof data === "object" && data !== null && "error" in data
              ? String((data as { error: unknown }).error)
              : "Failed to load temple";
          throw new Error(msg);
        }
        setDetail(data as SuperAdminTempleDetail);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load temple");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 py-24 text-zinc-600 dark:text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" aria-hidden />
        <p className="text-sm">Loading temple…</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Temple not found."}</p>
      </div>
    );
  }

  return <TempleWizard mode="edit" tenantId={tenantId} initialDetail={detail} />;
}
