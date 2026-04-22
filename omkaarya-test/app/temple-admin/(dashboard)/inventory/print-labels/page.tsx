"use client";

import { useState, useMemo } from "react";
import { Download, Printer } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type PrintItem = {
  ico: string;
  name: string;
  sku: string;
  selected: boolean;
  copies: number;
};

const INITIAL_ITEMS: PrintItem[] = [
  { ico: "🟠", name: "Besan Ladoo", sku: "PRD-001", selected: true, copies: 1 },
  { ico: "🟡", name: "Motichoor Ladoo", sku: "PRD-002", selected: true, copies: 1 },
  { ico: "⚪", name: "Coconut Ladoo", sku: "PRD-003", selected: true, copies: 1 },
  { ico: "🌸", name: "Rose Garland", sku: "FLW-001", selected: false, copies: 1 },
  { ico: "🌼", name: "Marigold Loose", sku: "FLW-002", selected: false, copies: 1 },
  { ico: "🕯️", name: "Camphor Tablets", sku: "PJA-001", selected: false, copies: 1 },
  { ico: "🧴", name: "Sesame Oil", sku: "OIL-001", selected: false, copies: 1 },
  { ico: "💨", name: "Sandalwood Incense", sku: "INC-001", selected: false, copies: 1 },
];

// ── Barcode SVG ───────────────────────────────────────────────────

function Barcode({ sku }: { sku: string }) {
  const bars = [3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 1];
  return (
    <div className="flex gap-px h-9 items-end justify-center my-1">
      {bars.map((w, i) => (
        <div key={i} className="bg-zinc-900 dark:bg-zinc-100" style={{ width: `${w}px`, height: `${i % 4 === 0 ? 38 : i % 2 === 0 ? 30 : 24}px` }} />
      ))}
    </div>
  );
}

function QRCode() {
  return (
    <div className="w-[50px] h-[50px] mx-auto my-1 bg-zinc-900 dark:bg-zinc-100 rounded-sm relative p-1.5">
      <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-[2px]">
        {Array.from({ length: 25 }).map((_, i) => {
          const filled = [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24, 6, 12, 18, 7, 11, 17].includes(i);
          return <div key={i} className={filled ? "bg-white dark:bg-zinc-900" : "bg-zinc-900 dark:bg-zinc-100"} />;
        })}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
      {msg}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function PrintLabelsPage() {
  const [labelMode, setLabelMode] = useState<"bc" | "qr">("bc");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const toggleItem = (i: number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, selected: !item.selected } : item));
  };

  const adjustQty = (i: number, delta: number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, copies: Math.max(1, item.copies + delta) } : item));
  };

  const selectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.map((item, origIdx) => ({ ...item, origIdx })).filter(item =>
      !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
    );
  }, [items, search]);

  const selectedItems = items.filter(i => i.selected);

  const selectCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)] cursor-pointer";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Print Labels</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Generate barcode or QR code labels for inventory items</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => showToast("Downloading PDF...")} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Download className="w-3.5 h-3.5" />PDF
          </button>
          <button onClick={() => showToast("Printing...")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
            <Printer className="w-3.5 h-3.5" />Print selected
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 w-fit border border-zinc-200 dark:border-zinc-700">
        <button onClick={() => setLabelMode("bc")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${labelMode === "bc" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] font-bold shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}>
          📊 Barcode
        </button>
        <button onClick={() => setLabelMode("qr")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${labelMode === "qr" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] font-bold shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}>
          ⬛ QR Code
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left — Item Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Select items</h2>
            <button onClick={selectAll} className="px-2.5 py-1 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Select all</button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Search */}
            <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-[7px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 bg-transparent w-full font-[inherit] placeholder:text-zinc-400" />
              </div>
            </div>

            {/* Items */}
            {filteredItems.map((item) => (
              <div key={item.origIdx} className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={item.selected} onChange={() => toggleItem(item.origIdx)} className="w-3.5 h-3.5 cursor-pointer accent-[var(--brand-primary)]" />
                  <div className="w-[26px] h-[26px] rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">{item.ico}</div>
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{item.sku}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => adjustQty(item.origIdx, -1)} className="w-[26px] h-[26px] border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 flex items-center justify-center text-sm text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">−</button>
                  <span className="text-xs font-bold w-5 text-center text-zinc-900 dark:text-zinc-100">{item.copies}</span>
                  <button onClick={() => adjustQty(item.origIdx, 1)} className="w-[26px] h-[26px] border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 flex items-center justify-center text-sm text-zinc-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Preview & Settings */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Preview</h2>

          {/* Label Preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Label preview</div>
            <div className="flex flex-wrap gap-2">
              {selectedItems.length === 0 ? (
                <div className="text-xs text-zinc-400 py-4 text-center w-full">Select items to preview labels</div>
              ) : (
                selectedItems.slice(0, 4).map((item, i) => (
                  <div key={i} className="border-[1.5px] border-zinc-200 dark:border-zinc-700 rounded-lg p-3 flex flex-col items-center min-w-[100px] bg-white dark:bg-zinc-900">
                    <div className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 text-center leading-tight mb-1">{item.name}</div>
                    {labelMode === "bc" ? <Barcode sku={item.sku} /> : <QRCode />}
                    <div className="text-[9px] text-zinc-400 font-mono mt-1">{item.sku}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-3">Print settings</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Label size</label>
                <select className={selectCls}>
                  <option>Small — 50×25mm</option>
                  <option>Medium — 75×37mm</option>
                  <option>Large — 100×50mm</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Copies per item</label>
                <input type="number" defaultValue={1} min={1} className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Show on label</label>
                <select className={selectCls}>
                  <option>Name + SKU code</option>
                  <option>Name + Code + Price</option>
                  <option>Code only</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Printer</label>
                <select className={selectCls}>
                  <option>Default printer</option>
                  <option>Label printer (USB)</option>
                  <option>Save as PDF</option>
                </select>
              </div>
            </div>
            <button onClick={() => showToast("Printing labels...")} className="w-full mt-4 px-4 py-2.5 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors flex items-center justify-center gap-1.5">
              <Printer className="w-3.5 h-3.5" />Print labels
            </button>
          </div>
        </div>
      </div>

      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
