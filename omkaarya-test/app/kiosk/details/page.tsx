"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, User, Search, X, Fingerprint, Heart, Stars, CheckCircle2, UserPlus, CreditCard, ShoppingBag, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NAKSHATRA_MAPPING: Record<string, string> = {
  "Ashwini": "Mesha", "Bharani": "Mesha", "Krithika": "Mesha / Vrishaba", "Rohini": "Vrishaba",
  "Mrigashira": "Vrishaba / Mithuna", "Arudra": "Mithuna", "Punarvasu": "Mithuna / Karka",
  "Pushya": "Karka", "Ashlesha": "Karka", "Magha": "Simha", "Purva Phalguni": "Simha",
  "Uttara Phalguni": "Simha / Kanya", "Hasta": "Kanya", "Chitra": "Kanya / Tula",
  "Swati": "Tula", "Vishakha": "Tula / Vrishchika", "Anuradha": "Vrishchika", "Jyeshta": "Vrishchika",
  "Mula": "Dhanu", "Purva Ashadha": "Dhanu", "Uttara Ashadha": "Dhanu / Makara",
  "Shravana": "Makara", "Dhanishta": "Makara / Kumbha", "Shatabhisha": "Kumbha",
  "Purva Bhadrapada": "Kumbha / Meena", "Uttara Bhadrapada": "Meena", "Revati": "Meena"
};
const NAKSHATRAMS = Object.keys(NAKSHATRA_MAPPING);
const SECURE_DB: Record<string, any[]> = {
  "762082227": [
    { name: "Lambodharan Sharma", gothram: "Baradwaja", star: "Ashwini" },
    { name: "Saraswathi Sharma", gothram: "Baradwaja", star: "Rohini" },
  ]
};

const PRODUCTS = [
  { id: 4, name: "Ghee Lamp", price: 15, desc: "Pure cow ghee" },
  { id: 5, name: "Vibhuthi", price: 5, desc: "Blessed sacred ash" },
];

interface Devotee {
  id: number;
  name: string;
  gothram: string;
  star: string;
  rasi: string;
}

export default function KioskDetailsPage() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [savedFamily, setSavedFamily] = useState<any[]>([]);
  const [devotees, setDevotees] = useState<Devotee[]>([{ id: Date.now(), name: "", gothram: "", star: "", rasi: "" }]);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("kiosk_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("kiosk_cart", JSON.stringify(newCart));
  };

  const addSevaAndGo = (nextPath: string) => {
    const ritual = { id: Date.now(), name: "Archchanai", price: 10, q: 1, type: "seva", devotees };
    updateCart([...cart, ritual]);
    router.push(nextPath);
  };

  const toggleProduct = (item: any, delta: number) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      updateCart(cart.map(i => i.id === item.id ? { ...i, q: Math.max(0, i.q + delta) } : i).filter(i => i.q > 0));
    } else if (delta > 0) {
      updateCart([...cart, { ...item, q: 1, type: "product" }]);
    }
  };

  const handleSearch = () => {
    if (mobileNumber.length < 9) return;
    setSearchStatus("searching");
    setTimeout(() => {
      const results = SECURE_DB[mobileNumber];
      if (results) { setSavedFamily(results); setSearchStatus("found"); } 
      else { setSearchStatus("not_found"); setSavedFamily([]); }
    }, 800);
  };

  const handleQuickSelect = (member: any) => {
    setDevotees([...devotees, { ...member, id: Date.now(), rasi: NAKSHATRA_MAPPING[member.star] }]);
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB] overflow-hidden relative select-none">
      <header className="bg-[#111] pt-12 pb-8 px-8 text-center shadow-2xl relative z-30">
        <div className="absolute top-12 left-6">
           <button onClick={() => router.back()}><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><ChevronLeft className="w-4 h-4 text-white" /></div></button>
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-1">Omkaarya</h1>
        <p className="text-[8px] font-black text-brand uppercase tracking-[0.5em] opacity-80">Ritual Details</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-48">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
           <div className="flex items-center gap-3"><User className="w-4 h-4 text-brand" /><span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Returning?</span></div>
           <button onClick={() => setIsRegistered(!isRegistered)} className={`w-12 h-7 rounded-full relative transition-all ${isRegistered ? "bg-brand" : "bg-text-disabled"}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${isRegistered ? "left-6" : "left-1"}`} /></button>
        </div>

        {isRegistered && (
          <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4 animate-in slide-in-from-top-2">
             <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-black text-sm opacity-40">+94</div>
                <input type="tel" maxLength={9} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} placeholder="7x xxx xxxx" className="w-full h-12 pl-12 pr-4 rounded-2xl bg-subtle border-none font-black text-lg" />
                <button disabled={mobileNumber.length < 9} onClick={handleSearch} className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center ${mobileNumber.length === 9 ? "bg-brand text-white" : "bg-text-disabled opacity-40"}`}><Search className="w-4 h-4" /></button>
             </div>
             {searchStatus === "found" && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                   {savedFamily.map((m, i) => (<button key={i} onClick={() => handleQuickSelect(m)} className="shrink-0 bg-brand/5 border border-brand/10 rounded-xl px-4 py-3 flex items-center gap-2"><Plus className="w-3 h-3 text-brand" /><span className="text-[10px] font-black uppercase text-brand truncate max-w-[100px]">{m.name}</span></button>))}
                </div>
             )}
          </div>
        )}

        <div className="space-y-4">
           {devotees.map((d, index) => (
             <div key={d.id} className="relative bg-white p-6 rounded-[32px] border border-border shadow-sm space-y-6 animate-in slide-in-from-right-2">
               <div className="absolute top-0 left-8 bg-brand text-white text-[7px] font-black px-4 py-1.5 rounded-b-xl tracking-widest uppercase">Devotee {index + 1}</div>
               {index > 0 && <button onClick={() => setDevotees(devotees.filter(x => x.id !== d.id))} className="absolute right-4 top-4 text-error"><X className="w-5 h-5" /></button>}
               <div className="space-y-2 pt-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-2">Sacred Name</label><input value={d.name} onChange={(e) => setDevotees(devotees.map(x => x.id === d.id ? {...x, name: e.target.value} : x))} placeholder="Full Name" className="w-full h-12 px-6 rounded-2xl bg-subtle border-none font-black text-base uppercase" /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-2">Star</label><select value={d.star} onChange={(e) => setDevotees(devotees.map(x => x.id === d.id ? {...x, star: e.target.value, rasi: NAKSHATRA_MAPPING[e.target.value]} : x))} className="w-full h-12 px-6 rounded-2xl bg-subtle border-none font-black text-xs appearance-none uppercase"><option value="">Select Star</option>{NAKSHATRAMS.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-[8px] font-black uppercase tracking-widest text-text-tertiary ml-2">Rasi</label><div className="h-12 px-6 rounded-2xl bg-subtle flex items-center text-xs font-black text-brand uppercase">{d.rasi || "Auto"}</div></div>
               </div>
             </div>
           ))}
           <button onClick={() => setDevotees([...devotees, { id: Date.now(), name: "", gothram: "", star: "", rasi: "" }])} className="w-full h-14 rounded-3xl border-2 border-dashed border-brand/10 text-brand font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-3 bg-white active:scale-95 transition-all"><Plus className="w-4 h-4" /> Add Family Member</button>
        </div>
      </div>

      <div className="absolute bottom-32 left-8 right-8 z-40">
         <button onClick={() => setShowProductSheet(true)} className="w-full h-12 bg-white border-2 border-brand/20 rounded-2xl flex items-center justify-center gap-3 text-brand font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all group">
            <ShoppingBag className="w-4 h-4 group-hover:animate-bounce" /> Add Ghee Lamps & Products +
         </button>
      </div>

      <div className="absolute bottom-8 left-8 right-8 z-40">
         <div className="bg-[#111] rounded-2xl p-4 shadow-2xl flex gap-3 border border-white/10 ring-1 ring-white/5">
            <button onClick={() => addSevaAndGo("/kiosk/select")} className="flex-1 h-12 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[8px] active:scale-95 transition-all">Add to Cart</button>
            <button onClick={() => addSevaAndGo("/kiosk/payment")} className="flex-1 h-12 bg-brand text-white rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-brand/40"><CreditCard className="w-4 h-4" /> Next Step</button>
         </div>
      </div>

      {showProductSheet && (
        <>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowProductSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[#FDFCFB] rounded-t-[40px] z-[101] flex flex-col max-h-[70%] animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <header className="pt-8 pb-6 px-8 flex justify-between items-center border-b border-border bg-white rounded-t-[40px]">
               <div><h2 className="text-sm font-black text-text-primary uppercase tracking-tight">Temple Products</h2><p className="text-[8px] font-black text-brand uppercase tracking-[0.3em] mt-1">Sacred Items</p></div>
               <button onClick={() => setShowProductSheet(false)} className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center"><X className="w-5 h-5 text-text-tertiary" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
               {PRODUCTS.map(item => {
                 const inCart = cart.find(ci => ci.id === item.id);
                 return (
                   <div key={item.id} className="bg-white rounded-2xl p-4 border border-border flex items-center justify-between shadow-sm">
                      <div className="flex-1"><h4 className="text-[10px] font-black text-text-primary uppercase">{item.name}</h4><p className="text-[7px] font-bold text-text-tertiary uppercase mt-0.5">LKR {item.price}</p></div>
                      <div className="flex items-center gap-3">
                         {inCart ? (
                           <div className="flex items-center gap-2 bg-brand/5 rounded-lg p-0.5">
                              <button onClick={() => toggleProduct(item, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-brand"><Minus className="w-2 h-2" /></button>
                              <span className="text-[10px] font-black text-brand">{inCart.q}</span>
                              <button onClick={() => toggleProduct(item, 1)} className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center"><Plus className="w-2 h-2" /></button>
                           </div>
                         ) : (
                           <button onClick={() => toggleProduct(item, 1)} className="h-8 px-4 rounded-lg bg-brand text-white text-[8px] font-black uppercase tracking-widest shadow-md">Add +</button>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
            <footer className="p-8 bg-white border-t border-border"><button onClick={() => setShowProductSheet(false)} className="w-full h-14 bg-[#111] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">Done - Return to Form</button></footer>
          </div>
        </>
      )}
    </div>
  );
}
