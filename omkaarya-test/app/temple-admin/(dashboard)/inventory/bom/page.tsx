"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ListTree, 
  Plus, 
  Search, 
  ChevronRight, 
  MoreVertical,
  Settings2,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Save
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";

const MOCK_BOM = [
  {
    name: 'Rudrabhishekam',
    duration: '45 min',
    price: '£75',
    items: [
      { ico: '🕯️', name: 'Camphor Tablets', unit: 'Packets', qty: 3, opt: false, stock: 44 },
      { ico: '🧴', name: 'Sesame Oil', unit: 'Litres', qty: 2, opt: false, stock: 18 },
      { ico: '🌸', name: 'Rose Garland', unit: 'Garlands', qty: 4, opt: false, stock: 12 },
      { ico: '🌿', name: 'Tulsi Leaves', unit: 'Bunches', qty: 2, opt: false, stock: 8 },
      { ico: '🔴', name: 'Kumkum Powder', unit: 'Packets', qty: 1, opt: true, stock: 25 },
    ]
  },
  {
    name: 'Archana',
    duration: '15 min',
    price: '£3',
    items: [
      { ico: '🕯️', name: 'Camphor Tablets', unit: 'Packets', qty: 1, opt: false, stock: 44 },
      { ico: '🔴', name: 'Kumkum Powder', unit: 'Packets', qty: 1, opt: false, stock: 25 },
      { ico: '🌸', name: 'Rose Garland', unit: 'Garlands', qty: 1, opt: true, stock: 12 },
    ]
  }
];

export default function PoojaBOMPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary mb-1">
              <Link href="/temple-admin/inventory" className="hover:text-brand transition-colors">Inventory</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand">Pooja BOM</span>
           </div>
           <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Pooja Bill of Materials (BOM)</h1>
           <p className="text-[12px] text-text-tertiary mt-1">Map which inventory items are needed per pooja type — auto-deducts stock when pooja is confirmed</p>
        </div>
        <Button size="sm" leadingIcon={<Plus className="w-4 h-4" />}>Add Pooja Type</Button>
      </div>

      {/* ── Tip Alert ─────────────────────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4">
         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
         </div>
         <div>
            <div className="text-[12px] font-bold text-blue-900">How BOM works</div>
            <p className="text-[11px] text-blue-700/80 mt-1 leading-relaxed">
              When a pooja is booked, these items are automatically marked as "issued to priest". When the priest returns unused items via <strong>Return from Pooja</strong>, quantities are added back. If stock is insufficient for a booking, a warning shows during booking creation.
            </p>
         </div>
      </div>

      {/* ── BOM List ──────────────────────────────────────────────── */}
      <div className="space-y-4">
         {MOCK_BOM.map((pooja, pi) => (
            <div key={pi} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
               <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gray-50/30">
                  <div>
                     <div className="text-[14px] font-extrabold text-text-primary tracking-tight">{pooja.name}</div>
                     <div className="text-[11px] text-text-tertiary font-medium mt-0.5">
                        Duration: {pooja.duration} · Price: {pooja.price} · {pooja.items.length} items mapped
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" leadingIcon={<Plus className="w-4 h-4" />}>Add Item</Button>
                     <Button size="sm" leadingIcon={<Save className="w-4 h-4" />}>Save BOM</Button>
                  </div>
               </div>
               
               <div className="divide-y divide-border-secondary px-5">
                  {pooja.items.map((item, ii) => {
                    const isLow = item.stock < item.qty;
                    return (
                      <div key={ii} className="flex flex-col md:flex-row md:items-center gap-4 py-3.5">
                         <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center text-[16px] shrink-0">{item.ico}</div>
                            <div className="flex flex-col min-w-0">
                               <div className="text-[12px] font-bold text-text-primary truncate">{item.name}</div>
                               <div className="text-[10px] text-text-placeholder">Current stock: {item.stock} {item.unit}</div>
                               {isLow && (
                                 <div className="flex items-center gap-1 text-[9px] font-black text-status-danger-text mt-0.5 uppercase">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Insufficient stock for 1 booking
                                 </div>
                               )}
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 defaultValue={item.qty} 
                                 className="w-16 h-8 px-2 rounded-lg border border-border bg-white text-[12px] text-center font-bold outline-none focus:border-brand transition-all"
                               />
                               <span className="text-[11px] text-text-tertiary font-medium w-12">{item.unit}</span>
                            </div>

                            <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-gray-50 border border-border">
                               <input type="checkbox" defaultChecked={!item.opt} className="w-3.5 h-3.5 rounded accent-brand" />
                               <span className="text-[11px] font-bold text-text-secondary">{item.opt ? 'Optional' : 'Required'}</span>
                            </div>

                            <Button variant="ghost" size="sm" iconOnly className="text-status-danger-text hover:bg-status-danger-bg"><Trash2 className="w-4 h-4" /></Button>
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}
