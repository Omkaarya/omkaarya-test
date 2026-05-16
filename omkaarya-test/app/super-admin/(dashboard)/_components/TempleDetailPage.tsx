"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import TempleWizard from "./TempleWizard";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import type { SuperAdminTempleDetail } from "@/lib/super-admin-temple-detail";

export function EditTempleLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 py-24 text-zinc-600 dark:text-zinc-400">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" aria-hidden />
      <p className="text-sm">Loading temple…</p>
    </div>
  );
}

function TempleDetailInner({ readOnly }: { readOnly: boolean }) {
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
          throw new Error(jsonApiErrorMessage(data) || "Failed to load temple");
        }
        const raw = data as { success?: boolean; data?: SuperAdminTempleDetail };
        setDetail(raw.success && raw.data ? raw.data : (data as SuperAdminTempleDetail));
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
    return <EditTempleLoading />;
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-5xl py-12 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Temple not found."}</p>
      </div>
    );
  }

  return <TempleWizard mode="edit" tenantId={tenantId} initialDetail={detail} readOnly={readOnly} />;
}

/** Shared loader for `/super-admin/edit-temple/...` and `/super-admin/view-temple/...`. */
export default function TempleDetailPage({ readOnly }: { readOnly: boolean }) {
  return (
    <Suspense fallback={<EditTempleLoading />}>
      <TempleDetailInner readOnly={readOnly} />
    </Suspense>
  );
}
