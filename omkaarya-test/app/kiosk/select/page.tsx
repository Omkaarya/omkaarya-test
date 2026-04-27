"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Plus, Minus, Sparkles, ArrowRight, X, Heart, ShoppingBag, CheckCircle2, Calendar, Gift, Wallet } from "lucide-react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────

const NAKSHATRA_MAPPING: Record<string, string> = {
  "Ashwini": "Mesha", "Bharani": "Mesha", "Karthigai": "Mesha / Vrishaba", "Rohini": "Vrishaba",
  "Mrigashira": "Vrishaba / Mithuna", "Arudra": "Mithuna", "Punarvasu": "Mithuna / Karka",
  "Pushya": "Karka", "Ashlesha": "Karka", "Magha": "Simha", "Purva Phalguni": "Simha",
  "Uttara Phalguni": "Simha / Kanya", "Hasta": "Kanya", "Chitra": "Kanya / Tula",
  "Swati": "Tula", "Vishakha": "Tula / Vrishchika", "Anuradha": "Vrishchika", "Jyeshta": "Vrishchika",
  "Mula": "Dhanu", "Purva Ashadha": "Dhanu", "Uttara Ashadha": "Dhanu / Makara",
  "Shravana": "Makara", "Dhanishta": "Makara / Kumbha", "Shatabhisha": "Kumbha",
  "Purva Bhadrapada": "Kumbha / Meena", "Uttara Bhadrapada": "Meena", "Revati": "Meena"
};
const NAKSHATRAMS = Object.keys(NAKSHATRA_MAPPING);

const ITEMS = [
  { id: 1, name: "Normal Archchanai", price: 10, cat: "arch", desc: "Basic family offering", type: "seva" },
  { id: 2, name: "Kalaanji Archchanai", price: 25, cat: "arch", desc: "Includes sacred prasadam", type: "seva" },
  { id: 3, name: "Kunguma Archchanai", price: 25, cat: "arch", desc: "Devi sanctum offering", type: "seva" },
  { id: 4, name: "Ghee Lamp", price: 15, cat: "prod", desc: "Hand-lit terracotta lamp", type: "product" },
  { id: 5, name: "Vibhuthi", price: 5, cat: "prod", desc: "Blessed sacred ash", type: "product" },
  { id: 8, name: "Coconut & Flower Pack", price: 50, cat: "prod", desc: "Pooja Essentials", type: "product" },
  // DONATIONS
  { id: 10, name: "General Donation", price: 0, cat: "donate", desc: "Support Temple Maintenance", type: "donation" },
  { id: 11, name: "Annadhanam", price: 50, cat: "donate", desc: "Feed the Needy", type: "donation" },
  { id: 12, name: "Temple Building Fund", price: 100, cat: "donate", desc: "Sacred Construction", type: "donation" },
];

export default function KioskSelectionPage() {
  const [activeTab, setActiveTab] = useState("arch");
  const [cart, setCart] = useState<any[]>([]);
  const [sheet, setSheet] = useState<"none" | "details" | "upsell" | "cross_sell" | "donation">("none");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [devotees, setDevotees] = useState<any[]>([{ id: Date.now(), name: "", gothram: "", star: "", rasi: "", date: new Date().toISOString().split('T')[0] }]);
  const [customDonation, setCustomDonation] = useState("");

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("kiosk_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("kiosk_cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((s, i) => s + (i.price * (i.q || 1)), 0);

  const toggleProduct = (item: any, delta: number) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      setCart(cart.map(i => i.id === item.id ? { ...i, q: Math.max(0, i.q + delta) } : i).filter(i => i.q > 0));
    } else if (delta > 0) {
      setCart([...cart, { ...item, q: 1, type: "product" }]);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    if (item.type === "seva") setSheet("details");
    else if (item.type === "donation") setSheet("donation");
  };

  const addDonationToCart = (amount: number) => {
    const donation = { ...selectedItem, id: Date.now(), price: amount, q: 1, type: "donation" };
    setCart([...cart, donation]);
    setSheet("none");
    setCustomDonation("");
  };

  const finalizeRitual = () => {
    const ritual = { ...selectedItem, id: Date.now(), q: 1, type: "seva", devotees };
    setCart([...cart, ritual]);
    setSheet("none");
    setDevotees([{ id: Date.now(), name: "", gothram: "", star: "", rasi: "", date: new Date().toISOString().split('T')[0] }]);
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB] relative overflow-hidden select-none">
      
      {/* Header */}
      <header className="bg-[#111] pt-12 pb-8 px-8 text-center shadow-2xl relative z-30">
        <div className="absolute top-12 left-6">
           <Link href="/kiosk"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><ChevronLeft className="w-4 h-4 text-white" /></div></Link>
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-1 text-shadow">Omkaarya</h1>
        <p className="text-[8px] font-black text-brand uppercase tracking-[0.5em] opacity-80">Sacred Terminal</p>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-border px-8 flex gap-3 overflow-x-auto no-scrollbar py-4 shadow-sm z-20">
         {["arch", "prod", "donate", "ubhay"].map(id => (
           <button key={id} onClick={() => setActiveTab(id)} className={`shrink-0 h-10 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 border ${activeTab === id ? "bg-brand text-white border-brand shadow-lg" : "bg-subtle text-text-tertiary border-transparent"}`}>
              <span className="text-[9px] font-black uppercase tracking-widest">
                 {id === "arch" ? "Archchanai" : id === "prod" ? "Prasadam" : id === "donate" ? "Donations" : "Ubhayams"}
              </span>
           </button>
         ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-48">
         <div className="grid grid-cols-1 gap-4">
            {ITEMS.filter(i => i.cat === activeTab).map(item => {
               const inCart = cart.find(ci => ci.id === item.id);
               return (
                 <div key={item.id} className="bg-white rounded-2xl p-5 border border-border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex-1 pr-4 border-r border-dashed border-border/60">
                       <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">{item.name}</h3>
                       <p className="text-[8px] font-bold text-text-tertiary mt-1 uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <div className="pl-4 flex flex-col items-end gap-3 min-w-[90px]">
                       <div className="text-lg font-black text-brand tracking-tighter">
                          {item.price === 0 ? "Any" : `LKR ${item.price}`}
                       </div>
                       {item.type === "product" ? (
                         inCart ? (
                           <div className="flex items-center gap-2 bg-brand/5 rounded-lg p-0.5">
                              <button onClick={() => toggleProduct(item, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-brand"><Minus className="w-2 h-2" /></button>
                              <span className="text-[10px] font-black text-brand">{inCart.q}</span>
                              <button onClick={() => toggleProduct(item, 1)} className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center"><Plus className="w-2 h-2" /></button>
                           </div>
                         ) : (
                           <button onClick={() => toggleProduct(item, 1)} className="h-8 px-5 rounded-lg bg-brand text-white text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all">Add</button>
                         )
                       ) : (
                         <button onClick={() => handleItemSelect(item)} className="h-8 px-4 rounded-lg bg-[#111] text-white text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
                            {item.type === "donation" ? "Donate" : "Select"} <ArrowRight className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      {/* CHECKOUT BAR */}
      <div className="absolute bottom-8 left-8 right-8 z-40">
         <div className="bg-[#111] rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-white/5">
            <div className="flex flex-col pl-2">
               <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em] mb-0.5">Total Offering</span>
               <div className="flex items-baseline gap-1"><span className="text-[10px] font-black text-brand/80 uppercase">LKR</span><span className="text-xl font-black text-white tracking-tighter">{total.toFixed(0)}</span></div>
            </div>
            <Link href="/kiosk/payment">
               <button disabled={total === 0} className={`h-11 px-8 rounded-xl flex items-center gap-3 transition-all duration-500 font-black uppercase text-[9px] tracking-widest ${total > 0 ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-white/10 text-white/20"}`}>
                  <ShoppingCart className="w-4 h-4" /> Checkout
               </button>
            </Link>
         </div>
      </div>

      {/* BOTTOM SHEET */}
      {sheet !== "none" && (
        <>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setSheet("none")} />
          <div className="absolute bottom-0 left-0 right-0 bg-[#FDFCFB] rounded-t-[40px] z-[101] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] flex flex-col max-h-[85%] animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
            
            <header className="pt-8 pb-6 px-8 flex justify-between items-center border-b border-border bg-white rounded-t-[40px]">
               <div>
                  <h2 className="text-sm font-black text-text-primary uppercase tracking-tight">
                     {sheet === "details" ? selectedItem?.name : sheet === "donation" ? "Make a Donation" : "Upsell"}
                  </h2>
                  <p className="text-[8px] font-black text-brand uppercase tracking-[0.3em] mt-1">
                     {sheet === "details" ? "Ritual Details" : sheet === "donation" ? "Temple Support" : "Sacred Items"}
                  </p>
               </div>
               <button onClick={() => setSheet("none")} className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center active:scale-90"><X className="w-5 h-5 text-text-tertiary" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               
               {sheet === "details" && (
                 <div className="space-y-6">
                    {/* DATE SELECTOR (NEW) */}
                    <div className="bg-brand/5 p-5 rounded-3xl border border-brand/10 space-y-3">
                       <div className="flex items-center gap-2 text-brand"><Calendar className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Perform Ritual On:</span></div>
                       <input type="date" value={devotees[0].date} onChange={(e) => setDevotees(devotees.map(d => ({...d, date: e.target.value})))} className="w-full h-12 px-5 rounded-2xl bg-white border-none font-black text-base uppercase shadow-sm" />
                       <p className="text-[7px] font-bold text-text-tertiary uppercase tracking-widest ml-1 opacity-60">Defaults to Today. Select future date for Birthday / Anniversary.</p>
                    </div>

                    {devotees.map((d, i) => (
                       <div key={d.id} className="bg-white p-6 rounded-3xl border border-border space-y-5 shadow-sm relative pt-10">
                          <div className="absolute top-0 left-8 bg-[#111] text-white text-[7px] font-black px-4 py-1.5 rounded-b-xl tracking-widest uppercase">Devotee {i+1}</div>
                          {i > 0 && <button onClick={() => setDevotees(devotees.filter(x => x.id !== d.id))} className="absolute right-4 top-4 text-error active:scale-90"><X className="w-4 h-4" /></button>}
                          <div className="space-y-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-1">Full Name</label><input value={d.name} onChange={(e) => setDevotees(devotees.map(x => x.id === d.id ? {...x, name: e.target.value} : x))} className="w-full h-12 px-5 rounded-2xl bg-subtle border-none font-black text-base uppercase" /></div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-1">Nakshatram</label><select value={d.star} onChange={(e) => setDevotees(devotees.map(x => x.id === d.id ? {...x, star: e.target.value, rasi: NAKSHATRA_MAPPING[e.target.value] || ""} : x))} className="w-full h-12 px-5 rounded-2xl bg-subtle border-none font-black text-xs appearance-none uppercase"><option value="">Select Star</option>{NAKSHATRAMS.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                             <div className="space-y-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-1">Rasi</label><div className="h-12 px-5 rounded-2xl bg-subtle flex items-center text-xs font-black text-brand uppercase">{d.rasi || "Auto"}</div></div>
                          </div>
                       </div>
                    ))}
                    <button onClick={() => setDevotees([...devotees, { ...devotees[0], id: Date.now(), name: "" }])} className="w-full h-12 rounded-2xl border-2 border-dashed border-brand/20 text-brand font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Family Member</button>
                 </div>
               )}

               {sheet === "donation" && (
                 <div className="space-y-8 py-4">
                    <div className="text-center space-y-2">
                       <div className="w-14 h-14 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner"><Wallet className="w-7 h-7" /></div>
                       <h3 className="text-sm font-black uppercase text-text-primary tracking-tight">Support the Sacred Temple</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       {[10, 50, 100, 500].map(amt => (
                          <button key={amt} onClick={() => addDonationToCart(amt)} className="h-16 rounded-2xl bg-white border border-border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-brand hover:bg-brand/5 shadow-sm">
                             <span className="text-[10px] font-black text-text-tertiary uppercase">LKR</span>
                             <span className="text-xl font-black text-text-primary">{amt}</span>
                          </button>
                       ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-dashed border-border/60">
                       <label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-1">Custom Donation Amount</label>
                       <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand font-black">LKR</div>
                          <input type="number" value={customDonation} onChange={(e) => setCustomDonation(e.target.value)} placeholder="0.00" className="w-full h-16 pl-16 pr-6 rounded-3xl bg-subtle border-none font-black text-2xl tracking-tighter" />
                       </div>
                       <button onClick={() => addDonationToCart(Number(customDonation))} disabled={!customDonation} className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all ${customDonation ? "bg-brand text-white active:scale-95" : "bg-text-disabled text-white/50 cursor-not-allowed"}`}>Confirm Donation</button>
                    </div>
                 </div>
               )}

               {sheet === "upsell" && (
                 <div className="space-y-8 py-4">
                    <div className="text-center space-y-2">
                       <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-2"><Sparkles className="w-6 h-6" /></div>
                       <h3 className="text-xs font-black uppercase tracking-tight text-text-primary leading-tight">Complete your Offering?<br/>Devotees also added these Items</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       {ITEMS.filter(i => i.cat === "prod" && (i.id === 4 || i.id === 8)).map(item => {
                          const inCart = cart.find(ci => ci.id === item.id);
                          return (
                            <div key={item.id} className="bg-white rounded-3xl p-5 border border-border flex items-center justify-between shadow-sm">
                               <div className="flex-1">
                                  <span className="text-[7px] font-black text-brand uppercase tracking-widest mb-1 block">Recommended</span>
                                  <h4 className="text-[11px] font-black text-text-primary uppercase">{item.name}</h4>
                                  <p className="text-[8px] font-bold text-text-tertiary uppercase mt-1">LKR {item.price}</p>
                               </div>
                               <button onClick={() => toggleProduct(item, 1)} className="h-10 px-6 rounded-xl bg-brand text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 active:scale-95">Add +</button>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               )}
            </div>

            <footer className="p-8 bg-white border-t border-border flex gap-4">
               {sheet === "details" && (
                 <div className="flex w-full gap-3">
                    <button onClick={() => setSheet("upsell")} className="flex-1 h-14 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                       Add to Cart <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               )}
               {sheet === "upsell" && (
                  <button onClick={finalizeRitual} className="w-full h-14 bg-[#111] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                     Go to Checkout <CheckCircle2 className="w-4 h-4" />
                  </button>
               )}
            </footer>
          </div>
        </>
      )}

    </div>
  );
}
