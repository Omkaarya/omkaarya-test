"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Plus, Minus, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "arch", name: "Archchanai", subtitle: "Rituals" },
  { id: "prod", name: "Prasadam", subtitle: "Blessed" },
  { id: "ubhay", name: "Ubhayams", subtitle: "Sponsors" },
];

const ITEMS = [
  { id: 1, name: "Normal Archchanai", price: 10, cat: "arch", desc: "Basic family offering", type: "seva" },
  { id: 2, name: "Kalaanji Archchanai", price: 25, cat: "arch", desc: "Includes sacred prasadam", type: "seva" },
  { id: 3, name: "Kunguma Archchanai", price: 25, cat: "arch", desc: "Devi sanctum offering", type: "seva" },
  { id: 4, name: "Ghee Lamp", price: 15, cat: "prod", desc: "Hand-lit terracotta lamp", type: "product" },
  { id: 5, name: "Vibhuthi", price: 5, cat: "prod", desc: "Blessed sacred ash", type: "product" },
];

export default function KioskSelectionPage() {
  const [cat, setCat] = useState("arch");
  const [cart, setCart] = useState<any[]>([]);

  // Load cart from memory on mount
  useEffect(() => {
    const saved = localStorage.getItem("kiosk_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("kiosk_cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((s, i) => s + (i.price * (i.q || 1)), 0);

  const toggleProduct = (item: any, delta: number) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      setCart(cart.map(i => i.id === item.id ? { ...i, q: Math.max(0, i.q + delta) } : i).filter(i => i.q > 0));
    } else if (delta > 0) {
      setCart([...cart, { ...item, q: 1 }]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden select-none bg-[#FDFCFB]">
      <header className="bg-[#111] pt-12 pb-8 px-8 text-center shadow-2xl relative z-30">
        <div className="absolute top-12 left-6">
           <Link href="/kiosk">
             <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                <ChevronLeft className="w-4 h-4 text-white" />
             </div>
           </Link>
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-1">Omkaarya</h1>
        <p className="text-[8px] font-black text-brand uppercase tracking-[0.5em] opacity-80">Sacred Terminal</p>
      </header>

      <div className="bg-white border-b border-border px-8 flex gap-2 overflow-x-auto no-scrollbar py-4 shadow-sm z-20">
         {CATEGORIES.map(c => (
           <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 h-10 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 border ${cat === c.id ? "bg-brand text-white border-brand shadow-lg" : "bg-subtle text-text-tertiary border-transparent"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${cat === c.id ? "bg-white" : "bg-brand/20"}`} />
              <span className="text-[9px] font-black uppercase tracking-widest">{c.name}</span>
           </button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-40">
         <div className="grid grid-cols-1 gap-4">
            {ITEMS.filter(i => i.cat === cat).map(item => {
               const inCart = cart.find(ci => ci.id === item.id);
               return (
                 <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white rounded-2xl p-5 border border-border flex items-center justify-between group-hover:border-brand/40 transition-all shadow-sm">
                       <div className="flex-1 pr-4 border-r border-dashed border-border/60">
                          <div className="flex items-center gap-2 mb-1.5"><Sparkles className="w-3 h-3 text-brand" /><span className="text-[7px] font-black text-brand uppercase tracking-[0.2em]">Sacred Item</span></div>
                          <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">{item.name}</h3>
                          <p className="text-[8px] font-bold text-text-tertiary mt-1 uppercase tracking-widest opacity-80">{item.desc}</p>
                       </div>
                       <div className="pl-4 flex flex-col items-end gap-3 min-w-[90px]">
                          <div className="text-right">
                             <div className="text-[7px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Exchange</div>
                             <div className="text-lg font-black text-brand tracking-tighter">LKR {item.price}</div>
                          </div>
                          {item.type === "seva" ? (
                            <Link href="/kiosk/details">
                               <button className="h-8 px-4 rounded-lg bg-[#111] text-white text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
                                  Select <ArrowRight className="w-3 h-3" />
                               </button>
                            </Link>
                          ) : (
                            inCart ? (
                              <div className="flex items-center gap-2 bg-brand/5 rounded-lg p-0.5">
                                 <button onClick={() => toggleProduct(item, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-brand shadow-sm"><Minus className="w-2 h-2" /></button>
                                 <span className="text-[10px] font-black text-brand">{inCart.q}</span>
                                 <button onClick={() => toggleProduct(item, 1)} className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center shadow-sm"><Plus className="w-2 h-2" /></button>
                              </div>
                            ) : (
                              <button onClick={() => toggleProduct(item, 1)} className="h-8 px-5 rounded-lg bg-brand text-white text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                 Add
                              </button>
                            )
                          )}
                       </div>
                    </div>
                 </div>
               );
            })}
         </div>
         <div className="flex flex-col items-center gap-3 py-10 opacity-50"><div className="h-[1px] w-12 bg-brand/30" /><p className="text-[7px] font-black uppercase tracking-[0.5em] text-center text-text-tertiary">Agamic Ritual Tradition</p></div>
      </div>

      <div className="absolute bottom-8 left-8 right-8 z-50">
         <div className="bg-[#111] rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-white/5">
            <div className="flex flex-col pl-2">
               <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em] mb-0.5">Total Offering</span>
               <div className="flex items-baseline gap-1"><span className="text-[10px] font-black text-brand/80 uppercase">LKR</span><span className="text-xl font-black text-white tracking-tighter">{total.toFixed(0)}</span></div>
            </div>
            <Link href="/kiosk/payment">
               <button disabled={total === 0} className={`h-11 px-8 rounded-xl flex items-center gap-3 transition-all duration-500 font-black uppercase text-[9px] tracking-widest ${total > 0 ? "bg-brand text-white shadow-lg" : "bg-white/10 text-white/20"}`}>
                  <ShoppingCart className="w-4 h-4" /> Checkout
               </button>
            </Link>
         </div>
      </div>
    </div>
  );
}
