"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { fetchTempleAdminJson, type InventorySupplier } from "@/lib/temple-admin-api";

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-1">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{value}</h3>
        <span className="text-[10px] font-bold text-zinc-400">{sub}</span>
      </div>
    </div>
  );
}

export default function SuppliersListPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventorySupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: InventorySupplier[] }>(
        "/api/temple-admin/inventory/suppliers"
      );
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load suppliers.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.contact_person ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const metrics = useMemo(() => {
    const active = items.filter((s) => s.is_active).length;
    return {
      total: items.length,
      active,
      inactive: items.length - active,
    };
  }, [items]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/inventory/suppliers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete supplier.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="VENDORS" value={String(metrics.total)} sub="all time" />
        <MetricCard title="ACTIVE" value={String(metrics.active)} sub="onboarded" />
        <MetricCard title="INACTIVE" value={String(metrics.inactive)} sub="disabled" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Suppliers Directory</h2>
            <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-[10px] font-bold text-orange-600 border border-orange-100 dark:border-orange-800">
              {items.length} Vendors
            </span>
          </div>
          <Link href="/temple-admin/inventory/suppliers/new">
            <Button leadingIcon={<Plus className="w-4 h-4" />}>Add Supplier</Button>
          </Link>
        </div>

        <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-zinc-900">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10"
              placeholder="Search vendor by name, email, or contact…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading suppliers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-sm text-zinc-500">
              {items.length === 0 ? "No suppliers yet." : "No suppliers match your search."}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-50 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Supplier</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment terms</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 border border-orange-100 font-black text-[10px]">
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{row.name}</div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{row.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{row.contact_person ?? "—"}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{row.phone ?? "—"}</div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {row.payment_terms ?? "—"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={row.is_active ? "Active" : "Inactive"} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
