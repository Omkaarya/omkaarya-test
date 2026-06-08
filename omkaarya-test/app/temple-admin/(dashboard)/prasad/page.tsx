"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type PrasadItem = {
  id: string;
  name: string;
  sku: string | null;
  category_name: string | null;
  price_amount: string;
  currency: string;
  status: string;
};

export default function PrasadItemsPage() {
  const [items, setItems] = useState<PrasadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", priceAmount: "0" });

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: PrasadItem[] }>("/api/temple-admin/prasad");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load prasad items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await fetchTempleAdminJson("/api/temple-admin/prasad", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          sku: form.sku.trim() || null,
          priceAmount: Number(form.priceAmount) || 0,
        }),
      });
      setForm({ name: "", sku: "", priceAmount: "0" });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create item.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prasad item?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/prasad/${id}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete item.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Prashadham Items</h1>
          <p className="text-sm text-zinc-500">Manage prasad items offered at your temple.</p>
        </div>
        <Link href="/temple-admin/prasad/categories">
          <Button variant="outline">Manage Categories</Button>
        </Link>
      </div>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 sm:grid-cols-4">
          <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="SKU" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          <input className="h-11 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Price" value={form.priceAmount} onChange={(e) => setForm((f) => ({ ...f, priceAmount: e.target.value }))} />
          <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={() => void handleCreate()}>Add Item</Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-16 text-zinc-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-widest text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.sku ?? "—"}</td>
                  <td className="px-4 py-3">{item.category_name ?? "—"}</td>
                  <td className="px-4 py-3">{item.currency} {item.price_amount}</td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-red-600 text-xs font-semibold" onClick={() => void handleDelete(item.id)}>
                      <Trash2 className="inline h-3.5 w-3.5" /> Delete
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
