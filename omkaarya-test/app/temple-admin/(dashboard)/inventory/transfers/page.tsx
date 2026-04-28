"use client";

import { useState } from "react";
import { Plus, Search, Download, ArrowRight, SendHorizonal, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type TransferStatus = "Draft" | "Confirmed" | "In Transit" | "Received" | "Cancelled";
type TransferPriority = "Normal" | "High" | "Urgent";

type StockTransfer = {
  id: string;
  transferNo: string;
  source: string;
  destination: string;
  items: number;
  value: number;
  priority: TransferPriority;
  status: TransferStatus;
  expectedDate: string;
  createdBy: string;
};

// ── Mock Data ──────────────────────────────────────────────────────

const TEMPLE_UNITS = [
  "Main Store",
  "Madapalli",
  "Moolasthanam",
  "Vasantha Mandapam",
  "Gopuram",
  "Donation Counter",
  "Administrative Office",
];

const SEED_TRANSFERS: StockTransfer[] = [
  { id: "1", transferNo: "TRF-2026-001", source: "Main Store", destination: "Madapalli",           items: 4,  value: 1250,  priority: "Normal", status: "Confirmed",  expectedDate: "2026-04-25", createdBy: "Ramesh Iyer" },
  { id: "2", transferNo: "TRF-2026-002", source: "Main Store", destination: "Moolasthanam",         items: 3,  value: 870,   priority: "High",   status: "In Transit", expectedDate: "2026-04-24", createdBy: "Priya Nair" },
  { id: "3", transferNo: "TRF-2026-003", source: "Main Store", destination: "Vasantha Mandapam",    items: 6,  value: 3400,  priority: "Urgent", status: "Draft",      expectedDate: "2026-04-26", createdBy: "Karthik Raja" },
  { id: "4", transferNo: "TRF-2026-004", source: "Madapalli",  destination: "Moolasthanam",         items: 2,  value: 480,   priority: "Normal", status: "Received",   expectedDate: "2026-04-22", createdBy: "Kamala Devi" },
  { id: "5", transferNo: "TRF-2026-005", source: "Main Store", destination: "Gopuram",              items: 2,  value: 640,   priority: "High",   status: "Confirmed",  expectedDate: "2026-04-25", createdBy: "Ramesh Iyer" },
  { id: "6", transferNo: "TRF-2026-006", source: "Main Store", destination: "Donation Counter",     items: 1,  value: 200,   priority: "Normal", status: "Cancelled",  expectedDate: "2026-04-23", createdBy: "Meena Lakshmi" },
];

// ── Status helpers ─────────────────────────────────────────────────

const STATUS_STYLE: Record<TransferStatus, string> = {
  "Draft":      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Confirmed":  "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  "In Transit": "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  "Received":   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  "Cancelled":  "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

const PRIORITY_STYLE: Record<TransferPriority, string> = {
  "Normal": "text-zinc-500 dark:text-zinc-400",
  "High":   "text-amber-600 dark:text-amber-400 font-bold",
  "Urgent": "text-red-600 dark:text-red-400 font-bold",
};

// ── New Transfer Drawer ────────────────────────────────────────────

function NewTransferDrawer({ onClose, onSave }: { onClose: () => void; onSave: (t: StockTransfer) => void }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [priority, setPriority] = useState<TransferPriority>("Normal");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState("1");
  const [value, setValue] = useState("");

  const canSave = source && destination && source !== destination && expectedDate;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: Date.now().toString(),
      transferNo: `TRF-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      source, destination,
      items: Number(items),
      value: Number(value) || 0,
      priority,
      status: "Draft",
      expectedDate,
      createdBy: "Temple Admin",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">New Stock Transfer</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Move items between temple units</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Source Unit <span className="text-red-500">*</span></label>
              <select value={source} onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]">
                <option value="">Select source…</option>
                {TEMPLE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Destination Unit <span className="text-red-500">*</span></label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]">
                <option value="">Select destination…</option>
                {TEMPLE_UNITS.filter((u) => u !== source).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {source && destination && source !== destination && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl px-4 py-3 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <span>{source}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
              <span>{destination}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No. of Items</label>
              <input type="number" min="1" value={items} onChange={(e) => setItems(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Est. Value (₹)</label>
              <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Priority</label>
            <div className="flex gap-2">
              {(["Normal", "High", "Urgent"] as TransferPriority[]).map((p) => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={[
                    "flex-1 py-2 rounded-lg border text-xs font-bold transition-colors",
                    priority === p
                      ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                  ].join(" ")}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Expected Date <span className="text-red-500">*</span></label>
            <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]" />
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Create Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(SEED_TRANSFERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterDest, setFilterDest] = useState("All");
  const [showDrawer, setShowDrawer] = useState(false);

  const filtered = transfers.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.transferNo.toLowerCase().includes(q) || t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    const matchSource = filterSource === "All" || t.source === filterSource;
    const matchDest = filterDest === "All" || t.destination === filterDest;
    return matchSearch && matchStatus && matchSource && matchDest;
  });

  const dispatch = (id: string) =>
    setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "In Transit" } : t));

  const cancel = (id: string) =>
    setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "Cancelled" } : t));

  const stats = [
    { label: "Total Transfers", value: transfers.length, color: "text-zinc-900 dark:text-zinc-50" },
    { label: "In Transit",      value: transfers.filter((t) => t.status === "In Transit").length, color: "text-blue-600 dark:text-blue-400" },
    { label: "Overdue",         value: 0, color: "text-red-600 dark:text-red-400" },
    { label: "Pending Action",  value: transfers.filter((t) => t.status === "Draft").length, color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Stock Transfers</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Move pooja items between temple units.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowDrawer(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> New Transfer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs font-medium text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search TRF No, source, destination…"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-zinc-400 outline-none focus:ring-2 ring-[var(--brand-primary)] transition-all text-zinc-900 dark:text-zinc-100" />
          </div>
          {[
            { label: "Status", value: filterStatus, setter: setFilterStatus, options: ["All", "Draft", "Confirmed", "In Transit", "Received", "Cancelled"] },
            { label: "Source", value: filterSource, setter: setFilterSource, options: ["All", ...TEMPLE_UNITS] },
            { label: "Destination", value: filterDest, setter: setFilterDest, options: ["All", ...TEMPLE_UNITS] },
          ].map(({ label, value, setter, options }) => (
            <select key={label} value={value} onChange={(e) => setter(e.target.value)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 ring-[var(--brand-primary)]">
              {options.map((o) => <option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}
            </select>
          ))}
        </div>

        <p className="px-5 py-3 text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
          Showing {filtered.length} of {transfers.length} transfers
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Transfer No.</th>
                <th className="px-6 py-4">Source → Destination</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expected</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{t.transferNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{t.source}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{t.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-700 dark:text-zinc-300">{t.items}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {t.value > 0 ? `₹${t.value.toLocaleString()}` : "—"}
                  </td>
                  <td className={`px-6 py-4 text-xs uppercase tracking-wider ${PRIORITY_STYLE[t.priority]}`}>
                    {t.priority}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[t.status]}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{t.expectedDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {t.status === "Confirmed" && (
                        <button onClick={() => dispatch(t.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
                          <SendHorizonal className="w-3.5 h-3.5" /> Dispatch
                        </button>
                      )}
                      {(t.status === "Draft" || t.status === "Confirmed") && (
                        <button onClick={() => cancel(t.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-zinc-400">No transfers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDrawer && (
        <NewTransferDrawer
          onClose={() => setShowDrawer(false)}
          onSave={(t) => setTransfers((prev) => [t, ...prev])}
        />
      )}
    </div>
  );
}
