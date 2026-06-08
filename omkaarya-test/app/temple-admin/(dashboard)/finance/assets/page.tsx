"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type AssetTab = "jewellery" | "land" | "metal" | "equipment";

type Asset = {
  id: string;
  asset_type: string;
  name: string;
  code: string | null;
  value_amount: string | null;
  currency: string;
  weight_or_area: string | null;
  status: string | null;
};

const TABS: { id: AssetTab; label: string }[] = [
  { id: "jewellery", label: "Jewellery" },
  { id: "land", label: "Land & Properties" },
  { id: "metal", label: "Metal / Furniture" },
  { id: "equipment", label: "Equipments" },
];

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetTab>("jewellery");
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", valueAmount: "" });

  const reload = async (tab: AssetTab) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: Asset[] }>(
        `/api/temple-admin/finance/assets?assetType=${encodeURIComponent(tab)}`
      );
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load assets.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload(activeTab);
  }, [activeTab]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await fetchTempleAdminJson("/api/temple-admin/finance/assets", {
        method: "POST",
        body: JSON.stringify({
          assetType: activeTab,
          name: form.name.trim(),
          code: form.code.trim() || null,
          valueAmount: form.valueAmount ? Number(form.valueAmount) : null,
        }),
      });
      setForm({ name: "", code: "", valueAmount: "" });
      await reload(activeTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create asset.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this asset record?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/finance/assets/${id}`, { method: "DELETE" });
      await reload(activeTab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete asset.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Assets Management</h1>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? "bg-[var(--brand-primary)] text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 rounded-2xl border p-4 sm:grid-cols-4 dark:border-zinc-800">
        <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
        <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Value" value={form.valueAmount} onChange={(e) => setForm((f) => ({ ...f, valueAmount: e.target.value }))} />
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={() => void handleCreate()}>Add Asset</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3">{a.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    {a.value_amount != null && a.value_amount !== ""
                      ? `${a.currency ?? "USD"} ${Number(a.value_amount).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{a.status ?? "—"}</td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-xs font-semibold text-red-600" onClick={() => void handleDelete(a.id)}>
                      <Trash2 className="inline h-3.5 w-3.5" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
