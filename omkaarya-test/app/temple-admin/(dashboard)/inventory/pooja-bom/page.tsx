"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────

type BOMItem = {
  ico: string;
  name: string;
  unit: string;
  qty: number;
  optional: boolean;
  stock: number;
};

type PoojaType = {
  name: string;
  duration: string;
  price: string;
  items: BOMItem[];
};

const POOJA_TYPES: PoojaType[] = [
  {
    name: "Rudrabhishekam", duration: "45 min", price: "£75",
    items: [
      { ico: "🕯️", name: "Camphor Tablets", unit: "Packets", qty: 3, optional: false, stock: 0 },
      { ico: "🧴", name: "Sesame Oil", unit: "Litres", qty: 2, optional: false, stock: 18 },
      { ico: "🌸", name: "Rose Garland", unit: "Garlands", qty: 4, optional: false, stock: 12 },
      { ico: "🌿", name: "Tulsi Leaves", unit: "Bunches", qty: 2, optional: false, stock: 8 },
      { ico: "🔴", name: "Kumkum Powder", unit: "Packets", qty: 1, optional: true, stock: 25 },
    ],
  },
  {
    name: "Archana", duration: "15 min", price: "£3",
    items: [
      { ico: "🕯️", name: "Camphor Tablets", unit: "Packets", qty: 1, optional: false, stock: 0 },
      { ico: "🔴", name: "Kumkum Powder", unit: "Packets", qty: 1, optional: false, stock: 25 },
      { ico: "🌸", name: "Rose Garland", unit: "Garlands", qty: 1, optional: true, stock: 12 },
    ],
  },
  {
    name: "Homam", duration: "3 hours", price: "£300",
    items: [
      { ico: "🔥", name: "Ghee (cow)", unit: "Litres", qty: 2, optional: false, stock: 4 },
      { ico: "🕯️", name: "Camphor Tablets", unit: "Packets", qty: 5, optional: false, stock: 0 },
      { ico: "🧴", name: "Sesame Oil", unit: "Litres", qty: 3, optional: false, stock: 18 },
    ],
  },
  {
    name: "Satyanarayan Puja", duration: "2 hours", price: "£120",
    items: [
      { ico: "🥥", name: "Whole Coconut", unit: "Pcs", qty: 5, optional: false, stock: 34 },
      { ico: "🌸", name: "Rose Garland", unit: "Garlands", qty: 6, optional: false, stock: 12 },
      { ico: "🕯️", name: "Camphor Tablets", unit: "Packets", qty: 4, optional: false, stock: 0 },
      { ico: "🔥", name: "Ghee (cow)", unit: "Litres", qty: 1, optional: false, stock: 4 },
      { ico: "🟠", name: "Besan Ladoo", unit: "Pcs", qty: 21, optional: true, stock: 42 },
    ],
  },
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

export default function PoojaBOMPage() {
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Pooja Bill of Materials (BOM)</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Map which inventory items are needed per pooja type — auto-deducts stock when pooja is confirmed</p>
        </div>
        <button onClick={() => showToast("Add new pooja type")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
          + Add pooja type
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex gap-2.5 items-start bg-blue-50 dark:bg-blue-950/30 border-[1.5px] border-blue-200 dark:border-blue-800/50 rounded-xl p-3">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <div>
          <div className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">How BOM works</div>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            When a pooja is booked, these items are automatically marked as &ldquo;issued to priest&rdquo;. When the priest returns unused items via <strong>Return from Pooja</strong>, quantities are added back. If stock is insufficient for a booking, a warning shows during booking creation.
          </div>
        </div>
      </div>

      {/* BOM Cards */}
      {POOJA_TYPES.map((pooja, pi) => (
        <div key={pi} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Pooja Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{pooja.name}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Duration: {pooja.duration} · Price: {pooja.price} · {pooja.items.length} items mapped
              </div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => showToast("Add item to BOM")} className="px-2.5 py-1.5 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors font-medium">
                + Add item
              </button>
              <button onClick={() => showToast("BOM saved!")} className="px-2.5 py-1.5 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors font-medium">
                Save BOM
              </button>
            </div>
          </div>

          {/* BOM Items */}
          <div className="px-4">
            {pooja.items.map((item, ii) => {
              const insufficient = item.stock < item.qty;
              return (
                <div key={ii} className="flex items-center gap-2.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                  <div className="w-[30px] text-center text-base">{item.ico}</div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Current stock: {item.stock} {item.unit}</div>
                    {insufficient && (
                      <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">⚠ Only {item.stock} in stock — insufficient for 1 booking</div>
                    )}
                  </div>
                  <input
                    type="number"
                    defaultValue={item.qty}
                    min={0}
                    className="w-[70px] border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs font-[inherit] text-center outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:border-[var(--brand-primary)] transition-colors"
                  />
                  <div className="w-[60px] text-[11px] text-zinc-500 dark:text-zinc-400">{item.unit}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <input type="checkbox" defaultChecked={!item.optional} className="w-3.5 h-3.5 cursor-pointer accent-[var(--brand-primary)]" />
                    <span>{item.optional ? "Optional" : "Required"}</span>
                  </div>
                  <button onClick={() => showToast("Item removed from BOM")} className="px-2 py-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-red-400 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
