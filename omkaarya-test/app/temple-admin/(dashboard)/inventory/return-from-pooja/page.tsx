"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────

type ReturnItem = {
  ico: string;
  name: string;
  sku: string;
  unit: string;
  issued: number;
  stock: number;
};

type PoojaBooking = {
  id: string;
  label: string;
  items: ReturnItem[];
};

const BOOKINGS: PoojaBooking[] = [
  {
    id: "P142", label: "POOJA-0142 — Rudrabhishekam — Rajan Kumar — Today 07:00",
    items: [
      { ico: "🕯️", name: "Camphor Tablets", sku: "PJA-001", unit: "Packets", issued: 3, stock: 0 },
      { ico: "🧴", name: "Sesame Oil", sku: "OIL-001", unit: "Litres", issued: 2, stock: 18 },
      { ico: "🌸", name: "Rose Garland", sku: "FLW-001", unit: "Garlands", issued: 4, stock: 12 },
      { ico: "🌿", name: "Tulsi Leaves", sku: "FLW-003", unit: "Bunches", issued: 2, stock: 8 },
      { ico: "🔴", name: "Kumkum Powder", sku: "PJA-002", unit: "Packets", issued: 1, stock: 25 },
    ],
  },
  {
    id: "P141", label: "POOJA-0141 — Archana — Priya Sharma — Today 09:30",
    items: [
      { ico: "🕯️", name: "Camphor Tablets", sku: "PJA-001", unit: "Packets", issued: 1, stock: 0 },
      { ico: "🔴", name: "Kumkum Powder", sku: "PJA-002", unit: "Packets", issued: 1, stock: 25 },
      { ico: "🌸", name: "Rose Garland", sku: "FLW-001", unit: "Garlands", issued: 1, stock: 12 },
    ],
  },
  {
    id: "P138", label: "POOJA-0138 — Homam — Sri Murugan Trust — 18 Apr",
    items: [
      { ico: "🔥", name: "Ghee (cow)", sku: "OIL-002", unit: "Litres", issued: 2, stock: 4 },
      { ico: "🕯️", name: "Camphor Tablets", sku: "PJA-001", unit: "Packets", issued: 5, stock: 0 },
      { ico: "🧴", name: "Sesame Oil", sku: "OIL-001", unit: "Litres", issued: 3, stock: 18 },
      { ico: "🌸", name: "Rose Garland", sku: "FLW-001", unit: "Garlands", issued: 8, stock: 12 },
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

export default function ReturnFromPoojaPage() {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState("");
  const [showItems, setShowItems] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const booking = BOOKINGS.find(b => b.id === selectedBooking);

  const handleSelectBooking = (val: string) => {
    setSelectedBooking(val);
    setShowItems(!!val);
    setShowSuccess(false);
  };

  const handleClear = () => {
    setSelectedBooking("");
    setShowItems(false);
    setShowSuccess(false);
  };

  const handleSubmit = () => {
    setShowItems(false);
    setShowSuccess(true);
    showToast("Items returned to stock. No financial entry created.");
  };

  const inputCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const selectCls = inputCls + " cursor-pointer";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Return from Pooja</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Return unused items from a completed pooja back to stock</p>
      </div>

      {/* Warning Banner */}
      <div className="flex gap-2.5 items-start bg-purple-50 dark:bg-purple-950/30 border-[1.5px] border-purple-200 dark:border-purple-800/50 rounded-xl p-3">
        <span className="text-lg shrink-0 mt-0.5">🔄</span>
        <div>
          <div className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">Inventory only — no financial entry will be created</div>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Items returned here go back to stock. The income from the original pooja booking is <strong>not reversed</strong>. If you need to refund money to a devotee, go to Finance → Add Transaction → Income reversal.
          </div>
        </div>
      </div>

      {/* Select Pooja */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">Select completed pooja</div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Pooja booking *</label>
            <select className={selectCls} value={selectedBooking} onChange={e => handleSelectBooking(e.target.value)}>
              <option value="">Select a completed pooja...</option>
              {BOOKINGS.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Returned by *</label>
            <select className={selectCls}>
              <option>Head Priest — Pandit Sharma</option>
              <option>Assistant Priest — Ravi</option>
              <option>Temple Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelCls}>Notes (optional)</label>
            <input className={inputCls} placeholder="e.g. Camphor fully used, flowers partially used, oil mostly unused..." />
          </div>
        </div>
      </div>

      {/* BOM Items */}
      {showItems && booking && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Items issued for this pooja</h2>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Enter the quantity being returned — cannot exceed qty issued</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-4">
            {/* Header */}
            <div className="flex items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              <div className="flex-1">Item</div>
              <div className="w-[100px] text-center">Qty issued</div>
              <div className="w-[120px] text-center">Returning qty</div>
              <div className="w-[100px] text-center">Stock after</div>
            </div>

            {/* Items */}
            {booking.items.map((item, i) => (
              <div key={i} className="flex items-center px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-[30px] h-[30px] rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm shrink-0">{item.ico}</div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{item.sku} · {item.unit}</div>
                  </div>
                </div>
                <div className="w-[100px] text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                  Issued: <strong className="text-zinc-900 dark:text-zinc-100">{item.issued}</strong>
                </div>
                <div className="w-[120px] text-center">
                  <input
                    type="number"
                    defaultValue={0}
                    min={0}
                    max={item.issued}
                    className="w-[80px] border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs font-[inherit] text-center outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:border-[var(--brand-primary)] transition-colors"
                  />
                </div>
                <div className="w-[100px] text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                  Current: {item.stock}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleClear} className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Clear</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">Return to stock</button>
          </div>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div>
          <div className="flex gap-2.5 items-start bg-emerald-50 dark:bg-emerald-950/30 border-[1.5px] border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3">
            <span className="text-lg shrink-0 mt-0.5">✅</span>
            <div>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Items returned to stock successfully</div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Items have been added back to inventory. No financial entry was created. Reference: RTRN-0042
              </div>
            </div>
          </div>
          <button onClick={() => router.push("/temple-admin/inventory/adjustments")} className="mt-3 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            ← Back to adjustments
          </button>
        </div>
      )}

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
