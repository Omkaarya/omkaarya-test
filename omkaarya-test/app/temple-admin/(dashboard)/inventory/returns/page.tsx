"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Search,
  History
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";

const MOCK_POOJAS = [
  { id: "P142", label: "POOJA-0142 — Rudrabhishekam — Rajan Kumar — Today 07:00", name: "Rudrabhishekam", devotee: "Rajan Kumar", items: [
    { ico: '🕯️', name: 'Camphor Tablets', sku: 'PJA-001', unit: 'Packets', issued: 3, stock: 44 },
    { ico: '🧴', name: 'Sesame Oil', sku: 'OIL-001', unit: 'Litres', issued: 2, stock: 18 },
    { ico: '🌸', name: 'Rose Garland', sku: 'FLW-001', unit: 'Garlands', issued: 4, stock: 12 },
    { ico: '🌿', name: 'Tulsi Leaves', sku: 'FLW-003', unit: 'Bunches', issued: 2, stock: 8 },
  ]},
  { id: "P141", label: "POOJA-0141 — Archana — Priya Sharma — Today 09:30", name: "Archana", devotee: "Priya Sharma", items: [
    { ico: '🕯️', name: 'Camphor Tablets', sku: 'PJA-001', unit: 'Packets', issued: 1, stock: 44 },
    { ico: '🔴', name: 'Kumkum Powder', sku: 'PJA-002', unit: 'Packets', issued: 1, stock: 25 },
  ]}
];

export default function PoojaReturnsPage() {
  const [selectedPoojaId, setSelectedPoojaId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [returnQtys, setReturnQtys] = useState<Record<string, string>>({});

  const selectedPooja = MOCK_POOJAS.find(p => p.id === selectedPoojaId);

  const handleSubmit = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-300">
        <div className="bg-surface rounded-2xl border-2 border-status-success-text/20 p-10 text-center shadow-xl">
           <div className="w-16 h-16 bg-status-success-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-status-success-text" />
           </div>
           <h2 className="text-2xl font-black text-text-primary tracking-tight">Items Returned Successfully</h2>
           <p className="text-[14px] text-text-tertiary mt-2 max-w-md mx-auto">
             Items have been added back to inventory. No financial entry was created, as this was a ritual return.
           </p>
           <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-border inline-block text-[11px] font-mono text-text-tertiary uppercase">
              Reference: RTRN-0042 · {new Date().toLocaleTimeString()}
           </div>
           <div className="mt-10 flex items-center justify-center gap-3">
              <Link href="/temple-admin/inventory">
                 <Button variant="outline">Back to Inventory</Button>
              </Link>
              <Button onClick={() => { setIsSuccess(false); setSelectedPoojaId(""); }}>Return More Items</Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
              <Link href="/temple-admin/inventory" className="hover:text-brand transition-colors">Inventory</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">Pooja Returns</span>
           </div>
           <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Return from Pooja</h1>
           <p className="text-[12px] text-text-tertiary mt-1">Return unused items from a completed pooja back to stock</p>
        </div>
        <Link href="/temple-admin/inventory/adjustments">
           <Button variant="outline" size="sm" leadingIcon={<History className="w-4 h-4" />}>Adjustment Log</Button>
        </Link>
      </div>

      {/* ── Info Alert ─────────────────────────────────────────────── */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-4">
         <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-purple-600" />
         </div>
         <div>
            <div className="text-[12px] font-bold text-purple-900">Inventory only — no financial entry</div>
            <p className="text-[11px] text-purple-700/80 mt-1 leading-relaxed">
              Items returned here go back to stock. The income from the original pooja booking is <strong>not reversed</strong>. If you need to refund money to a devotee, go to <strong>Finance → Income reversal</strong>.
            </p>
         </div>
      </div>

      {/* ── Step 1: Select Pooja ───────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
         <div className="text-[13px] font-bold text-text-primary mb-5 flex items-center justify-between border-b border-border-secondary pb-3">
            Select completed pooja
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Pooja Booking *</label>
               <select 
                 className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[13px] focus:ring-1 focus:ring-brand outline-none transition-all"
                 value={selectedPoojaId}
                 onChange={(e) => setSelectedPoojaId(e.target.value)}
               >
                  <option value="">Select a completed pooja...</option>
                  {MOCK_POOJAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Returned By *</label>
               <select className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[13px] focus:ring-1 focus:ring-brand outline-none transition-all">
                  <option>Head Priest — Pandit Sharma</option>
                  <option>Assistant Priest — Ravi</option>
                  <option>Temple Admin</option>
               </select>
            </div>
         </div>
      </div>

      {/* ── Step 2: Items List ─────────────────────────────────────── */}
      {selectedPooja && (
        <div className="animate-in slide-in-from-top-4 duration-300">
           <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[13px] font-bold text-text-primary">Items issued for this pooja</h3>
              <span className="text-[11px] text-text-placeholder font-medium">Enter the quantity being returned</span>
           </div>

           <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-gray-50/50 border-b border-border">
                    <tr>
                       <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Item</th>
                       <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center">Qty Issued</th>
                       <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center">Returning Qty</th>
                       <th className="px-5 py-3 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Current Stock</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-secondary">
                    {selectedPooja.items.map((item, i) => (
                       <tr key={i}>
                          <td className="px-5 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-[16px]">{item.ico}</div>
                                <div className="flex flex-col">
                                   <div className="text-[12px] font-bold text-text-primary">{item.name}</div>
                                   <div className="text-[10px] text-text-placeholder">{item.sku} · {item.unit}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                             <span className="text-[12px] font-black text-text-tertiary">/ {item.issued}</span>
                          </td>
                          <td className="px-5 py-4 flex justify-center">
                             <input 
                               type="number" 
                               defaultValue={0}
                               max={item.issued}
                               min={0}
                               className="w-20 h-9 px-2 rounded-lg border border-border bg-white text-[13px] text-center font-black focus:border-brand outline-none transition-all"
                             />
                          </td>
                          <td className="px-5 py-4 text-right">
                             <span className="text-[11px] font-bold text-text-placeholder">Currently {item.stock}</span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
              <div className="p-5 border-t border-border flex justify-end gap-3 bg-gray-50/20">
                 <Button variant="outline" onClick={() => setSelectedPoojaId("")}>Cancel</Button>
                 <Button onClick={handleSubmit}>Return to stock</Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
