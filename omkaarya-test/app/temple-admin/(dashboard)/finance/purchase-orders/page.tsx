"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl border border-success-500/20 bg-status-success-bg text-status-success-text px-5 py-4 shadow-xl">
      <CheckCircle2 className="h-5 w-5 shrink-0" /><p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── PO Data ───────────────────────────────────────────────────────
const POS = [
  { num: "PO-0034", supplier: "Sri Lakshmi Traders", date: "18 Apr", items: "Rose garland ×12, Marigold 2kg", amt: "£36.00", status: "Received" },
  { num: "PO-0033", supplier: "Vedic Supplies UK", date: "15 Apr", items: "Camphor 200g, Ghee 2L, Incense ×10", amt: "£68.00", status: "Received" },
  { num: "PO-0032", supplier: "Om Flowers London", date: "10 Apr", items: "Jasmine 500g, Lotus ×20", amt: "£45.00", status: "In transit" },
];

export default function PurchaseOrdersPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Purchase orders</h1>
          <p className="mt-1 text-sm text-text-tertiary">Supplier purchases — mark as received to auto-update inventory</p>
        </div>
        <Button variant="primary" size="sm">+ New PO</Button>
      </div>

      {/* 3 Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total POs this month</p>
          <p className="text-2xl font-bold text-text-primary">12</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Awaiting delivery</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-1.5">Total spent</p>
          <p className="text-2xl font-bold text-red-600">£1,120</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-subtle">
              {["PO number", "Supplier", "Date", "Items", "Amount", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-text-tertiary uppercase tracking-wider px-4 py-2.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POS.map((po, i) => (
              <tr key={i} className="border-b border-border-secondary last:border-b-0 hover:bg-subtle transition-colors">
                <td className="px-4 py-3 text-[11px] font-mono text-text-tertiary">{po.num}</td>
                <td className="px-4 py-3 text-xs text-text-primary">{po.supplier}</td>
                <td className="px-4 py-3 text-[11px] text-text-tertiary">{po.date}</td>
                <td className="px-4 py-3 text-[11px] text-text-secondary">{po.items}</td>
                <td className="px-4 py-3 text-[13px] font-bold text-red-600">{po.amt}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg before:w-[5px] before:h-[5px] before:rounded-full before:shrink-0 ${po.status === "Received" ? "bg-green-50 text-green-700 before:bg-green-600" : "bg-amber-50 text-amber-700 before:bg-amber-500"}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {po.status === "In transit" && (
                      <button onClick={() => showToast("Marked as received — inventory updated!")} className="text-[11px] border border-border rounded-md px-2 py-1 text-text-secondary hover:border-brand hover:text-brand transition-colors">Mark received</button>
                    )}
                    <button className="text-[11px] border border-border rounded-md px-2 py-1 text-text-secondary hover:border-brand hover:text-brand transition-colors">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
