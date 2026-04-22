"use client";

import { useState } from "react";
import {
  PackageCheck, HandHeart, RotateCcw, ShoppingCart, Gift, AlertTriangle,
  Undo2, SearchCheck, Info, CheckCircle2, XCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type AdjType = "received" | "pooja-use" | "ritual-return" | "counter-sale" | "donation-in" | "damaged" | "refund-stock" | "correction";

const ADJ_TYPES: { id: AdjType; Icon: React.ComponentType<{ className?: string }>; name: string; desc: string; cls: string }[] = [
  { id: "received", Icon: PackageCheck, name: "Stock received", desc: "New delivery from supplier", cls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "pooja-use", Icon: HandHeart, name: "Used in pooja", desc: "Issued to priest for pooja", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  { id: "ritual-return", Icon: RotateCcw, name: "Returned from pooja", desc: "Priest returns unused items", cls: "border-purple-500 bg-purple-50 dark:bg-purple-950/30" },
  { id: "counter-sale", Icon: ShoppingCart, name: "Counter sale", desc: "Sold via POS counter", cls: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "donation-in", Icon: Gift, name: "Donated item", desc: "In-kind donation received", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  { id: "damaged", Icon: AlertTriangle, name: "Damaged / expired", desc: "Spoiled or broken", cls: "border-red-500 bg-red-50 dark:bg-red-950/30" },
  { id: "refund-stock", Icon: Undo2, name: "Refund stock return", desc: "Item returned on refund", cls: "border-teal-500 bg-teal-50 dark:bg-teal-950/30" },
  { id: "correction", Icon: SearchCheck, name: "Stock count correction", desc: "Manual recount fix", cls: "border-blue-500 bg-blue-50 dark:bg-blue-950/30" },
];

const RECENT = [
  { name: "Rose Garland", sku: "FLW-001", type: "Received", typeCls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", change: "+20", changeCls: "text-emerald-600", newQty: 32, fin: true, by: "Admin", date: "Today 09:14", notes: "Weekly flower delivery" },
  { name: "Camphor Tablets", sku: "PJA-001", type: "Used in pooja", typeCls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", change: "−8", changeCls: "text-red-600", newQty: 0, fin: null, by: "Priest", date: "Today 07:30", notes: "Rudrabhishekam" },
  { name: "Sesame Oil", sku: "OIL-001", type: "Returned from pooja", typeCls: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", change: "+2L", changeCls: "text-purple-600", newQty: 13, fin: false, by: "Priest", date: "Yesterday", notes: "Abhishekam — partial use" },
  { name: "Besan Ladoo", sku: "PRD-001", type: "Donated item", typeCls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", change: "+30", changeCls: "text-blue-600", newQty: 72, fin: null, by: "Admin", date: "2 days ago", notes: "Donated by Rajan Kumar" },
];

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>{msg}</div>;
}

export default function StockAdjustmentsPage() {
  const [selectedType, setSelectedType] = useState<AdjType>("received");
  const [toast, setToast] = useState({ msg: "", show: false });
  const showToast = (msg: string) => { setToast({ msg, show: true }); setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500); };

  const inputCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const selectCls = inputCls + " cursor-pointer";
  const labelCls = "text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      <div><h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Stock Adjustments</h1><p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Log all stock movements — received, used in pooja, returned, donated or damaged</p></div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">Adjustment type</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ADJ_TYPES.map(t => (
            <button key={t.id} onClick={() => setSelectedType(t.id)} className={`p-3 rounded-xl border-2 text-center transition-all ${selectedType === t.id ? t.cls : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300"}`}>
              <div className="flex justify-center mb-1.5 text-zinc-600 dark:text-zinc-300"><t.Icon className="w-5 h-5" /></div>
              <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{t.name}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight">{t.desc}</div>
            </button>
          ))}
        </div>

        {selectedType === "ritual-return" && (
          <div className="flex gap-2.5 items-start bg-purple-50 dark:bg-purple-950/30 border-[1.5px] border-purple-200 dark:border-purple-800/50 rounded-xl p-3 mb-4">
            <RotateCcw className="w-5 h-5 shrink-0 mt-0.5 text-purple-600" />
            <div><div className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">Returned from pooja — inventory only</div><div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed"><strong>This adds items back to stock only. No financial entry will be created.</strong> If you need to refund money to a devotee, use Finance → Add Transaction → Income reversal instead.</div></div>
          </div>
        )}
        {selectedType === "damaged" && (
          <div className="flex gap-2.5 items-start bg-red-50 dark:bg-red-950/30 border-[1.5px] border-red-200 dark:border-red-800/50 rounded-xl p-3 mb-4">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div><div className="text-xs font-bold text-red-800 dark:text-red-300 mb-1">Damaged / expired items</div><div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">This will reduce stock. Optionally log a write-off expense if the items had significant value.</div></div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1"><label className={labelCls}>Product *</label><select className={selectCls}><option value="">Select product...</option><option>Besan Ladoo (PRD-001)</option><option>Camphor Tablets (PJA-001)</option><option>Rose Garland (FLW-001)</option><option>Marigold Loose (FLW-002)</option><option>Sesame Oil (OIL-001)</option><option>Kumkum Powder (PJA-002)</option><option>Ghee (OIL-002)</option><option>Cotton Wicks (OIL-003)</option></select></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Quantity *</label><input className={inputCls} type="number" placeholder="Enter quantity" min={1} /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Date *</label><input className={inputCls} type="date" defaultValue="2026-04-20" /></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Adjusted by</label><select className={selectCls}><option>Temple Admin</option><option>Head Priest</option><option>Assistant Priest</option><option>Trustee</option></select></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Linked pooja (if used in pooja)</label><select className={selectCls}><option value="">Not linked to a pooja</option><option>POOJA-0142 — Rudrabhishekam, 20 Apr</option><option>POOJA-0141 — Archana, 20 Apr</option><option>POOJA-0138 — Homam, 18 Apr</option></select></div>
          <div className="flex flex-col gap-1"><label className={labelCls}>Supplier (if received)</label><select className={selectCls}><option value="">N/A</option><option>Sri Lakshmi Traders</option><option>Om Flowers London</option><option>Vedic Supplies UK</option></select></div>
          <div className="flex flex-col gap-1 col-span-2"><label className={labelCls}>Notes / reason</label><input className={inputCls} placeholder="e.g. Weekly delivery from supplier, used for morning Rudrabhishekam..." /></div>
        </div>
        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Clear</button>
          <button onClick={() => showToast("Adjustment saved!")} className="px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-xs font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">Save adjustment</button>
        </div>
      </div>

      <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Recent adjustments</h2><button className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">View all →</button></div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50"><tr>{["Item", "Type", "Change", "New qty", "Financial impact", "By", "Date", "Notes"].map(h => <th key={h} className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3.5 py-2.5 text-left border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap first:pl-4">{h}</th>)}</tr></thead>
          <tbody>
            {RECENT.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-3.5 py-2.5 first:pl-4"><div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</div><div className="text-[10px] text-zinc-400 font-mono mt-0.5">{r.sku}</div></td>
                <td className="px-3.5 py-2.5"><span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.typeCls}`}><span className="w-[5px] h-[5px] rounded-full bg-current" />{r.type}</span></td>
                <td className={`px-3.5 py-2.5 font-bold ${r.changeCls}`}>{r.change}</td>
                <td className="px-3.5 py-2.5 font-bold text-zinc-900 dark:text-zinc-100">{r.newQty}</td>
                <td className="px-3.5 py-2.5 text-[11px]">
                  {r.fin === true && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" />Yes</span>}
                  {r.fin === false && <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-3 h-3" />No (inventory only)</span>}
                  {r.fin === null && <span className="text-zinc-500"><Info className="w-3 h-3 inline" /> N/A</span>}
                </td>
                <td className="px-3.5 py-2.5 text-[11px] text-zinc-600 dark:text-zinc-300">{r.by}</td>
                <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{r.date}</td>
                <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
