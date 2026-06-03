"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Wrench, ShoppingCart, FileBox, PartyPopper } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import { jsonApiErrorMessage } from "@/lib/api-envelope";
import { useValidationToast } from "@/lib/hooks/useValidationToast";
import { ValidationToast } from "@/app/components/ValidationToast";
import {
  fetchTempleAdminJson,
  type InventoryCategory,
  type InventoryStore,
  type InventorySupplier,
} from "@/lib/temple-admin-api";

type ProductType = "Consumable" | "Equipment" | "Sale Item" | "Admin" | "Festival";

const TYPES: { id: ProductType; Icon: React.ComponentType<{ className?: string }>; name: string; desc: string }[] = [
  { id: "Consumable", Icon: Package, name: "Consumable", desc: "Prasad, flowers, incense, oil" },
  { id: "Equipment", Icon: Wrench, name: "Equipment", desc: "Lamps, vessels, garments" },
  { id: "Sale Item", Icon: ShoppingCart, name: "POS / Sale item", desc: "Prasad packets, kits, books" },
  { id: "Admin", Icon: FileBox, name: "Office & Admin", desc: "Stationery, cleaning" },
  { id: "Festival", Icon: PartyPopper, name: "Festival stock", desc: "Festival-specific items" },
];

const CATEGORIES = ["Prasad", "Flowers", "Puja Supplies", "Oil & Lamps", "Lamps & Deepam", "Prasad Packets", "Stationery"];

export default function CreateProductPage() {
  const router = useRouter();
  const validationToast = useValidationToast();
  const [selectedType, setSelectedType] = useState<ProductType>("Consumable");

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [subCategory, setSubCategory] = useState("");
  const [sku] = useState(() => `PRD-${Date.now().toString(36).toUpperCase().slice(-8)}`);
  const [unit, setUnit] = useState("Pcs");
  const [quantity, setQuantity] = useState("0");
  const [reorderPoint, setReorderPoint] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [defaultStoreId, setDefaultStoreId] = useState("");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [stores, setStores] = useState<InventoryStore[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, sups, sts] = await Promise.all([
          fetchTempleAdminJson<{ items: InventoryCategory[] }>("/api/temple-admin/inventory/categories").catch(() => ({ items: [] })),
          fetchTempleAdminJson<{ items: InventorySupplier[] }>("/api/temple-admin/inventory/suppliers").catch(() => ({ items: [] })),
          fetchTempleAdminJson<{ items: InventoryStore[] }>("/api/temple-admin/inventory/stores").catch(() => ({ items: [] })),
        ]);
        if (!cancelled) {
          setCategories(cats.items ?? []);
          setSuppliers(sups.items ?? []);
          setStores(sts.items ?? []);
        }
      } catch {
        // best-effort only; leave empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const supplierName: string | null = supplierId
    ? suppliers.find((s) => s.id === supplierId)?.name ?? null
    : null;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      validationToast.show();
      return;
    }
    const qty = Number(quantity.trim() || "0");
    const reorder = reorderPoint.trim() === "" ? null : Number(reorderPoint.trim());
    const costNum = Number(costAmount.trim() || "0");

    setSaving(true);
    try {
      const res = await fetch("/api/temple-admin/inventory/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sku,
          name: trimmedName,
          category,
          subCategory: subCategory.trim(),
          productType: selectedType,
          quantity: Number.isFinite(qty) && qty >= 0 ? qty : 0,
          reorderPoint: reorder != null && Number.isFinite(reorder) && reorder >= 0 ? reorder : null,
          unit,
          costAmount: Number.isFinite(costNum) && costNum >= 0 ? costNum : 0,
          supplierName,
          imageUrl: null,
          categoryId: categoryId || null,
          supplierId: supplierId || null,
          defaultStoreId: defaultStoreId || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        validationToast.show();
        return;
      }
      setTimeout(() => router.push("/temple-admin/inventory"), 800);
    } catch {
      validationToast.show();
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const formSelectClass = "!text-xs !py-2 !rounded-lg !font-[inherit]";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";
  const readonlyCls = inputCls + " bg-zinc-50 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed";

  return (
    <div className="space-y-4 max-w-[900px]">
      <ValidationToast isOpen={validationToast.isOpen} onDismiss={validationToast.dismiss} />

      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span
          className="text-[var(--brand-primary)] cursor-pointer hover:underline"
          onClick={() => router.push("/temple-admin/inventory")}
        >
          All Products
        </span>
        <span className="text-zinc-400">›</span>
        <span>Add product</span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Add new product</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Select product type first — fields adjust based on what you&apos;re tracking
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/temple-admin/inventory")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
          Step 1 — Product type
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id)}
              className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                selectedType === t.id
                  ? "border-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/30"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300"
              }`}
            >
              <div className="flex justify-center mb-1.5 text-zinc-600 dark:text-zinc-300">
                <t.Icon className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{t.name}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
          Step 2 — Product information
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Product name *</label>
            <input
              className={inputCls}
              placeholder="e.g. Besan Ladoo, Brass Lamp 5-wick"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Category *</label>
            <SelectInput className={formSelectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Sub-category</label>
            <input
              className={inputCls}
              placeholder="Optional"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>SKU</label>
            <input className={readonlyCls} value={sku} readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Unit of measure *</label>
            <SelectInput className={formSelectClass} value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="Pcs">Pieces</option>
              <option value="Kg">Kg</option>
              <option value="Litres">Litres</option>
              <option value="Packets">Packets</option>
              <option value="Garlands">Garlands</option>
              <option value="Sets">Sets</option>
            </SelectInput>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
          Step 3 — Stock &amp; pricing
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Opening stock qty *</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Reorder level</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              placeholder="e.g. 50"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Unit cost (£)</label>
            <input
              className={inputCls}
              placeholder="e.g. 0.45"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
            />
          </div>
        </div>

        {(categories.length > 0 || suppliers.length > 0 || stores.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
            {categories.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Category (live)</label>
                <SelectInput className={formSelectClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
            {suppliers.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Supplier</label>
                <SelectInput className={formSelectClass} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
            {stores.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Default store</label>
                <SelectInput className={formSelectClass} value={defaultStoreId} onChange={(e) => setDefaultStoreId(e.target.value)}>
                  <option value="">—</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => router.push("/temple-admin/inventory")}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}
