"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type Product = { id: string; sku: string; name: string };
type LabelRow = { productId: string; name: string; sku: string | null; barcode: string; qrPayload: string };

export function InventoryPrintWorkspace({ labelType }: { labelType: "barcode" | "qr" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchTempleAdminJson<{ products: Product[] }>("/api/temple-admin/inventory/products");
        setProducts(data.products ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ labels: LabelRow[] }>("/api/temple-admin/inventory/print/labels", {
        method: "POST",
        body: JSON.stringify({ productIds: ids, labelType }),
      });
      setLabels(data.labels);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate labels.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
        {labelType === "qr" ? "Print QR Codes" : "Print Labels"}
      </h1>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{error}</p>}
      <input
        className="h-10 w-full max-w-md rounded-xl border px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="rounded-2xl border dark:border-zinc-800">
        <ul className="divide-y dark:divide-zinc-800">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-6 py-3">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-zinc-500">{p.sku}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button leadingIcon={<Printer className="h-4 w-4" />} disabled={generating || selected.size === 0} onClick={() => void handleGenerate()}>
        {generating ? "Generating…" : `Generate ${labelType === "qr" ? "QR" : "barcode"} labels`}
      </Button>
      {labels.length > 0 && (
        <div className="rounded-2xl border p-6 dark:border-zinc-800">
          <h2 className="mb-4 font-bold">Generated ({labels.length})</h2>
          <ul className="space-y-2 text-sm">
            {labels.map((l) => (
              <li key={l.productId} className="flex justify-between rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-900">
                <span>{l.name}</span>
                <code className="text-xs">{labelType === "qr" ? l.qrPayload : l.barcode}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
