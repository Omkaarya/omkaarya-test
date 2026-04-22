"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type SubCategory = { name: string; count: number };
type Category = { ico: string; name: string; desc: string; count: number; subs: SubCategory[] };

const INITIAL_CATS: Category[] = [
  { ico: "🔁", name: "Consumables", desc: "Items used up and restocked regularly", count: 148, subs: [
    { name: "Prasad", count: 38 }, { name: "Flowers", count: 24 }, { name: "Puja Supplies", count: 31 },
    { name: "Incense", count: 16 }, { name: "Oil & Lamps", count: 22 }, { name: "Cleaning & Misc", count: 17 },
  ]},
  { ico: "⚙️", name: "Equipment", desc: "Long-term assets tracked by condition and location", count: 42, subs: [
    { name: "Lamps & Deepam", count: 12 }, { name: "Vessels & Utensils", count: 14 }, { name: "Garments & Vastram", count: 8 },
    { name: "Sound & AV", count: 4 }, { name: "Furniture", count: 4 },
  ]},
  { ico: "🛒", name: "POS / Sale items", desc: "Items sold to devotees at the temple counter", count: 28, subs: [
    { name: "Prasad Packets", count: 8 }, { name: "Pooja Kits", count: 6 }, { name: "Books & Calendars", count: 7 }, { name: "Souvenirs", count: 7 },
  ]},
  { ico: "🗃️", name: "Office & Admin", desc: "Stationery and supplies for temple administration", count: 15, subs: [
    { name: "Stationery", count: 8 }, { name: "Cleaning Supplies", count: 7 },
  ]},
  { ico: "🎪", name: "Festival stock", desc: "Special items ordered for specific festivals", count: 10, subs: [
    { name: "Festival Decorations", count: 5 }, { name: "Festival Prasad", count: 3 }, { name: "Ritual Specials", count: 2 },
  ]},
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

export default function CategoriesPage() {
  const [cats] = useState<Category[]>(INITIAL_CATS);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [addInput, setAddInput] = useState("");
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  }, []);

  const toggleCat = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const openAdd = (i: number) => {
    setAddingTo(i);
    setAddInput("");
    if (!expanded[i]) setExpanded(prev => ({ ...prev, [i]: true }));
  };

  const saveSubCat = (i: number) => {
    if (!addInput.trim()) { showToast("Enter a name"); return; }
    showToast(`"${addInput.trim()}" added!`);
    setAddingTo(null);
    setAddInput("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Categories</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Manage product categories and sub-categories for all product types</p>
        </div>
        <button onClick={() => showToast("Opening add category form...")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
          <Plus className="w-3.5 h-3.5" />Add category
        </button>
      </div>

      {/* Type Stats */}
      <div className="grid grid-cols-5 gap-2.5">
        {cats.map((c, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{c.ico} {c.name}</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{c.count}</div>
          </div>
        ))}
      </div>

      {/* Category List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* List Header */}
        <div className="flex items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          <span className="flex-1">Category & sub-categories</span>
          <span className="w-[100px] text-center">Items</span>
          <span className="w-[120px] text-right pr-1">Actions</span>
        </div>

        {cats.map((cat, ci) => (
          <div key={ci}>
            {/* L1 — Category Row */}
            <div
              className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              onClick={() => toggleCat(ci)}
            >
              <button className={`w-5 h-5 rounded-[5px] border flex items-center justify-center text-[10px] mr-2.5 shrink-0 transition-all ${expanded[ci] ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500"}`}>
                {expanded[ci] ? "−" : "+"}
              </button>
              <div className="text-lg mr-2.5 shrink-0">{cat.ico}</div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{cat.desc}</div>
              </div>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-lg mr-3">{cat.count} items</span>
              <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                <button onClick={() => showToast("Edit")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Edit</button>
                <button onClick={() => showToast("Confirm delete?")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-red-400 hover:text-red-500 transition-colors">Del</button>
              </div>
            </div>

            {/* L2 — Sub-category Rows */}
            {expanded[ci] && cat.subs.map((sub, si) => (
              <div key={si} className="flex items-center py-2.5 pl-[52px] pr-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
                <div className="w-[7px] h-[7px] rounded-full bg-[var(--brand-primary)] opacity-40 mr-2.5 shrink-0" />
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex-1">{sub.name}</div>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-lg mr-3">{sub.count}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => showToast("Edit sub-category")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Edit</button>
                  <button onClick={() => showToast("Delete?")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-red-400 hover:text-red-500 transition-colors">Del</button>
                </div>
              </div>
            ))}

            {/* Inline Add Row */}
            {expanded[ci] && addingTo === ci && (
              <div className="flex items-center gap-2 py-2 pl-[52px] pr-4 border-t border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-800/10">
                <div className="w-[7px] h-[7px] rounded-full bg-[var(--brand-primary)] opacity-20 shrink-0" />
                <input
                  value={addInput}
                  onChange={e => setAddInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveSubCat(ci)}
                  placeholder="New sub-category name..."
                  autoFocus
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] focus:border-[var(--brand-primary)]"
                />
                <button onClick={() => saveSubCat(ci)} className="px-2.5 py-1.5 rounded-md bg-[var(--brand-primary)] text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">Save</button>
                <button onClick={() => setAddingTo(null)} className="px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] transition-colors">Cancel</button>
              </div>
            )}

            {/* Add Trigger */}
            {expanded[ci] && addingTo !== ci && (
              <div className="pl-[52px] pr-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => openAdd(ci)}
                  className="px-2 py-1 text-[11px] border border-orange-200 dark:border-orange-800/50 rounded-md text-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors font-semibold"
                >
                  + Add sub-category
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
