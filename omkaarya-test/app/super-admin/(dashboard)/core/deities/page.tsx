"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import type { DeityCatalogEntry } from "@/lib/deity-catalog";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import { AdminTableToolbar, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { Button } from "@/app/components/ds/atoms/Button";

type CatalogResponse = { entries: DeityCatalogEntry[] };

export default function DeitiesMasterPage() {
  const [entries, setEntries] = useState<DeityCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/super-admin/deity-catalog", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to load catalog");
        setEntries([]);
        return;
      }
      const data = json.data as CatalogResponse;
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setError("Network error — could not load deity catalog.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((d) => {
      const hay = `${d.name} ${d.secondaryLabel ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [entries, search]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageRows = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  const columns: ColumnDef<DeityCatalogEntry>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Catalog ID",
        cell: (d) => (
          <span className="font-mono text-xs font-semibold text-text-tertiary">{d.id}</span>
        ),
      },
      {
        key: "image",
        header: "Preview",
        cell: (d) => (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gradient-to-br ${d.placeholderHue} text-[10px] font-bold text-white shadow-sm`}
            aria-hidden
          >
            <ImageIcon className="h-4 w-4 text-white/90" />
          </div>
        ),
      },
      {
        key: "name",
        header: "Name",
        cell: (d) => (
          <div>
            <span className="text-sm font-bold text-text-primary">{d.name}</span>
            {d.secondaryLabel ? (
              <span className="ml-1.5 text-xs text-text-tertiary">{d.secondaryLabel}</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "usage",
        header: "Usage",
        cell: () => (
          <span className="text-xs text-text-secondary">Temple onboarding primary deity ids</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Deities</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Read-only catalog aligned with temple onboarding. Changes are made in code or future registry APIs.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          leadingIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <AdminListCard>
        <AdminTableToolbar>
          <AdminTableToolbarStart>
            <SearchInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={search ? () => setSearch("") : undefined}
              placeholder="Search by name…"
            />
          </AdminTableToolbarStart>
        </AdminTableToolbar>

        {loading && entries.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-text-tertiary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading catalog…</span>
          </div>
        ) : (
          <DataTable<DeityCatalogEntry>
            columns={columns}
            data={pageRows}
            keyExtractor={(d) => d.id}
          />
        )}

        <AdminPagination
          page={Math.min(page, totalPages)}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
        <p className="border-t border-border px-4 py-3 text-xs text-text-tertiary">
          {totalFiltered} {totalFiltered === 1 ? "entry" : "entries"} matching search · {entries.length} in catalog
        </p>
      </AdminListCard>
    </div>
  );
}
