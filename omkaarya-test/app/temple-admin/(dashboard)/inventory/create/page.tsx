"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Wrench, ShoppingCart, FileBox, PartyPopper } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";

// ── Types ──────────────────────────────────────────────────────────

type ProductType = "Consumable" | "Equipment" | "Sale Item" | "Admin" | "Festival";

const TYPES: { id: ProductType; Icon: React.ComponentType<{ className?: string }>; name: string; desc: string }[] = [
  { id: "Consumable", Icon: Package, name: "Consumable", desc: "Prasad, flowers, incense, oil" },
  { id: "Equipment", Icon: Wrench, name: "Equipment", desc: "Lamps, vessels, garments" },
  { id: "Sale Item", Icon: ShoppingCart, name: "POS / Sale item", desc: "Prasad packets, kits, books" },
  { id: "Admin", Icon: FileBox, name: "Office & Admin", desc: "Stationery, cleaning" },
  { id: "Festival", Icon: PartyPopper, name: "Festival stock", desc: "Festival-specific items" },
];

// ── Toast ──────────────────────────────────────────────────────────

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
      {msg}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ProductType>("Consumable");
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const handleSave = () => {
    showToast("Product saved!");
    setTimeout(() => router.push("/temple-admin/inventory"), 800);
  };

  const inputCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const formSelectClass = "!text-xs !py-2 !rounded-lg !font-[inherit]";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";
  const readonlyCls = inputCls + " bg-zinc-50 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed";

  return (
    <div className="space-y-4 max-w-[900px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="text-[var(--brand-primary)] cursor-pointer hover:underline" onClick={() => router.push("/temple-admin/inventory")}>All Products</span>
        <span className="text-zinc-400">›</span>
        <span>Add product</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Add new product</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Select product type first — fields adjust based on what you&apos;re tracking</p>
        </div>
        <button onClick={() => router.push("/temple-admin/inventory")} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />Back
        </button>
      </div>

      {/* Step 1 — Product Type */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">Step 1 — Product type</div>
        <div className="grid grid-cols-5 gap-2">
          {TYPES.map(t => (
            <button
              key={t.id}
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

      {/* Step 2 — Product Information */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">Step 2 — Product information</div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1"><label className={labelCls}>Product name *</label><input className={inputCls} placeholder="e.g. Besan Ladoo, Brass Lamp 5-wick" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Also known as</label><input className={inputCls} placeholder="Alternate or regional names" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Category *</label>
            <SelectInput className={formSelectClass}>
              <option value="">Select category</option>
              <optgroup label="Consumables"><option>Prasad</option><option>Flowers</option><option>Puja Supplies</option><option>Incense</option><option>Oil &amp; Lamps</option></optgroup>
              <optgroup label="Equipment"><option>Lamps &amp; Deepam</option><option>Vessels &amp; Utensils</option><option>Garments &amp; Vastram</option><option>Sound &amp; AV</option></optgroup>
              <optgroup label="POS / Sale"><option>Prasad Packets</option><option>Pooja Kits</option><option>Books &amp; Calendars</option><option>Souvenirs</option></optgroup>
              <optgroup label="Office"><option>Stationery</option><option>Cleaning Supplies</option></optgroup>
              <optgroup label="Festival"><option>Festival Decorations</option><option>Festival Prasad</option></optgroup>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Sub-category</label><SelectInput className={formSelectClass}><option>Select after category</option><option>Sweet &amp; cooked</option><option>Dry prasad</option><option>Fruit &amp; nut</option><option>Fire &amp; light</option><option>Sacred powders</option></SelectInput></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>SKU (auto-generated)</label><input className={readonlyCls} value="PRD-244" readOnly /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Unit of measure *</label><SelectInput className={formSelectClass}><option>Pieces</option><option>Kg</option><option>Grams</option><option>Litres</option><option>Ml</option><option>Packets</option><option>Garlands</option><option>Sticks</option><option>Bunches</option><option>Sets</option></SelectInput></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Used in / for</label><input className={inputCls} placeholder="e.g. Abhishekam, Archana, Deepam" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Frequency</label><SelectInput className={formSelectClass}><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Festival only</option><option>One-time</option></SelectInput></div>
          <div className="flex flex-col gap-1 col-span-2"><label className={labelCls}>Description / notes</label><textarea className={inputCls + " resize-none"} rows={2} placeholder="Storage notes, special handling etc." /></div>
        </div>
      </div>

      {/* Step 3 — Stock & Pricing */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">Step 3 — Stock &amp; pricing</div>
        <div className="grid grid-cols-4 gap-3.5">
          <div className="flex flex-col gap-1"><label className={labelCls}>Opening stock qty *</label><input className={inputCls} type="number" placeholder="0" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Reorder level</label><input className={inputCls} type="number" placeholder="e.g. 50" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Unit cost (£)</label><input className={inputCls} placeholder="e.g. 0.45" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Sale price (£)</label><input className={inputCls} placeholder="For POS items" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Storage location</label><input className={inputCls} placeholder="e.g. Shelf 2A, Storeroom" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Pooja BOM linked?</label><SelectInput className={formSelectClass}><option>No — general stock</option><option>Yes — link to pooja type</option></SelectInput></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Label type</label><SelectInput className={formSelectClass}><option>Auto barcode</option><option>Auto QR code</option><option>None</option></SelectInput></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Status</label><SelectInput className={formSelectClass}><option>Active</option><option>Inactive</option><option>Seasonal</option></SelectInput></div>
        </div>
        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button onClick={() => router.push("/temple-admin/inventory")} className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">Save product</button>
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
