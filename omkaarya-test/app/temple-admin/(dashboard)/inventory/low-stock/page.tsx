"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, AlertTriangle, XCircle, Cookie, Flower2, Flame, Wind, Droplets, FileBox, CheckCircle2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type StockStatus = "low" | "out";

type AlertItem = {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  sku: string;
  cat: string;
  catCls: string;
  qty: number;
  reorder: number;
  freq: string;
  status: StockStatus;
};

const ALERT_ITEMS: AlertItem[] = [
  { Icon: Cookie, name: "Besan Ladoo", sku: "PRD-001", cat: "Prasad", catCls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", qty: 42, reorder: 50, freq: "Daily", status: "low" },
  { Icon: Cookie, name: "Motichoor Ladoo", sku: "PRD-002", cat: "Prasad", catCls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", qty: 28, reorder: 30, freq: "Weekly", status: "low" },
  { Icon: Flower2, name: "Marigold Loose", sku: "FLW-002", cat: "Flowers", catCls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", qty: 3, reorder: 5, freq: "Daily", status: "low" },
  { Icon: Flame, name: "Camphor Tablets", sku: "PJA-001", cat: "Puja Supplies", catCls: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300", qty: 0, reorder: 10, freq: "Daily", status: "out" },
  { Icon: Wind, name: "Sandalwood Incense", sku: "INC-001", cat: "Incense", catCls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", qty: 0, reorder: 100, freq: "Daily", status: "out" },
  { Icon: Flame, name: "Ghee (cow)", sku: "OIL-002", cat: "Oil & Lamps", catCls: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300", qty: 4, reorder: 5, freq: "Daily", status: "low" },
  { Icon: Flame, name: "Cotton Wicks", sku: "OIL-003", cat: "Oil & Lamps", catCls: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300", qty: 0, reorder: 10, freq: "Daily", status: "out" },
  { Icon: Flower2, name: "Jasmine Loose", sku: "FLW-004", cat: "Flowers", catCls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", qty: 2, reorder: 3, freq: "Daily", status: "low" },
  { Icon: FileBox, name: "Temple Calendar 2026", sku: "POS-002", cat: "Books & Calendars", catCls: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", qty: 5, reorder: 20, freq: "Monthly", status: "low" },
];

type TabId = "all" | "low" | "out";

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>{msg}</div>;
}

export default function StockAlertsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("all");
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => { setToast({ msg, show: true }); setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500); };

  const lowCount = ALERT_ITEMS.filter(a => a.status === "low").length;
  const outCount = ALERT_ITEMS.filter(a => a.status === "out").length;
  const filtered = useMemo(() => tab === "low" ? ALERT_ITEMS.filter(a => a.status === "low") : tab === "out" ? ALERT_ITEMS.filter(a => a.status === "out") : ALERT_ITEMS, [tab]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: `All alerts (${ALERT_ITEMS.length})` },
    { id: "low", label: `Low stock (${lowCount})` },
    { id: "out", label: `Out of stock (${outCount})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Stock Alerts</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Items needing immediate attention — reorder or restock before next pooja</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => showToast("Emailing suppliers...")} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Mail className="w-3.5 h-3.5" />Email suppliers</button>
          <button onClick={() => router.push("/temple-admin/inventory/adjustments")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"><Plus className="w-3.5 h-3.5" />Restock</button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {tabs.map((t, i) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer font-[inherit] transition-colors ${i < tabs.length - 1 ? "border-r border-zinc-200 dark:border-zinc-700" : ""} ${tab === t.id ? "bg-orange-50 dark:bg-orange-950/30 text-[var(--brand-primary)] font-bold" : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>{["Item", "Type", "Category", "Current qty", "Reorder at", "Frequency", "Status", "Actions"].map(h => <th key={h} className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3.5 py-2.5 text-left border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap first:pl-4">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-3.5 py-2.5 first:pl-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0"><item.Icon className="w-4 h-4" /></div>
                    <div><div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div><div className="text-[10px] text-zinc-400 font-mono mt-0.5">{item.sku}</div></div>
                  </div>
                </td>
                <td className="px-3.5 py-2.5"><span className="inline-block text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wide bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">Consumable</span></td>
                <td className="px-3.5 py-2.5"><span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg ${item.catCls}`}>{item.cat}</span></td>
                <td className="px-3.5 py-2.5"><div className={`text-base ${item.status === "out" ? "text-red-600 dark:text-red-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}`}>{item.qty}</div></td>
                <td className="px-3.5 py-2.5 text-[11px] text-zinc-400">{item.reorder}</td>
                <td className="px-3.5 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">{item.freq}</td>
                <td className="px-3.5 py-2.5">
                  {item.status === "out"
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"><XCircle className="w-3 h-3" />Out of stock</span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><AlertTriangle className="w-3 h-3" />Low stock</span>}
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex gap-1.5">
                    {item.status === "out"
                      ? <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">Order now</span>
                      : <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">Reorder soon</span>}
                    <button onClick={() => router.push("/temple-admin/inventory/adjustments")} className="px-2 py-1 text-[11px] border border-orange-200 dark:border-orange-800/50 rounded-md text-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 transition-colors font-semibold">Restock</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800"><span className="text-[11px] text-zinc-500 dark:text-zinc-400">{filtered.length} items need attention</span></div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
