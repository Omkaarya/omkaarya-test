"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type Category = { id: string; name: string; description: string | null; is_active: boolean };

export default function PrasadCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchTempleAdminJson<{ items: Category[] }>("/api/temple-admin/prasad/categories");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await fetchTempleAdminJson("/api/temple-admin/prasad/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create category.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Prasad Categories</h1>
        <Link href="/temple-admin/prasad"><Button variant="outline">Back to Items</Button></Link>
      </div>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{error}</p>}
      <div className="flex gap-2">
        <input className="h-11 flex-1 rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button leadingIcon={<Plus className="h-4 w-4" />} onClick={() => void handleCreate()}>Add</Button>
      </div>
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        <ul className="divide-y rounded-2xl border border-zinc-100 dark:border-zinc-800">
          {items.map((c) => (
            <li key={c.id} className="px-6 py-4">
              <p className="font-semibold">{c.name}</p>
              {c.description && <p className="text-sm text-zinc-500">{c.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
