"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, CheckCircle2, QrCode, Home, Sparkles, Coins, Printer } from "lucide-react";
import Link from "next/link";

export default function KioskPaymentPage() {
  const [status, setStatus] = useState<"pay" | "done">("pay");
  const [payMethod, setPayMethod] = useState<"card" | "cash">("card");
  const [cart, setCart] = useState<any[]>([]);
  const [devotees, setDevotees] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("kiosk_cart") || "[]");
    setCart(saved);
    const allDevotees = saved.filter((i: any) => i.type === "seva").flatMap((i: any) => i.devotees || []);
    setDevotees(allDevotees);
  }, []);

  const total = cart.reduce((s, i) => s + (i.price * (i.q || 1)), 0);

  const handleFinish = (method: "card" | "cash") => {
    setPayMethod(method);
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="h-full flex flex-col bg-[#FDFCFB] animate-in fade-in duration-1000 select-none">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center pb-40">
           <div className={`w-16 h-16 ${payMethod === "cash" ? "bg-brand" : "bg-success"} text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-in zoom-in-50 duration-700`}>
              {payMethod === "cash" ? <Printer className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
           </div>
           <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight text-center">
              {payMethod === "cash" ? "Voucher Printed!" : "Payment Success!"}
           </h2>
           <p className="text-[8px] font-black text-text-tertiary mt-4 uppercase tracking-[0.4em] opacity-60 text-center">
              {payMethod === "cash" ? "Pay Cash at Counter" : "Offerings Accepted"}
           </p>

           {/* THERMAL VOUCHER */}
           <div className="mt-10 w-full max-w-[280px] relative animate-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="bg-white p-8 shadow-2xl relative border border-border/40">
                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-[140px] font-black">ॐ</div>
                 <div className="relative z-10 text-center">
                    <div className="flex flex-col items-center gap-1 mb-8 border-b border-dashed border-border pb-6">
                       <span className="text-lg font-black text-brand uppercase tracking-[0.3em]">Omkaarya</span>
                       <span className="text-[7px] font-black text-text-tertiary uppercase tracking-widest leading-loose">Pooja Collection Voucher</span>
                       <div className="text-[7px] font-black uppercase text-text-disabled mt-3 tracking-widest">27 APR 2026 • #OM-{Math.floor(Math.random()*9000)+1000}</div>
                    </div>

                    {payMethod === "cash" && (
                       <div className="bg-brand/5 border border-brand/20 p-3 rounded-xl mb-6">
                          <span className="text-[9px] font-black text-brand uppercase tracking-widest">CASH PAYMENT PENDING</span>
                       </div>
                    )}

                    <div className="space-y-6 text-left mb-8">
                       {devotees.length > 0 && (
                          <div className="space-y-4">
                             <span className="text-[7px] font-black text-brand uppercase tracking-[0.2em] border-b border-brand/10 pb-1 block">Devotee Details</span>
                             {devotees.map((d, i) => (
                               <div key={i} className="space-y-0.5">
                                  <div className="text-[10px] font-black text-text-primary uppercase">{d.name}</div>
                                  <div className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest">Star: {d.star} • Raasi: {d.rasi}</div>
                               </div>
                             ))}
                          </div>
                       )}
                       <div className="space-y-3 pt-4 border-t border-dashed border-border/60">
                          <span className="text-[7px] font-black text-text-disabled uppercase tracking-[0.2em]">Items to Collect</span>
                          {cart.map((item, i) => (
                             <div key={i} className="flex justify-between items-start">
                                <span className="text-[9px] font-black text-text-primary uppercase max-w-[120px]">{item.q}x {item.name}</span>
                                <span className="text-[9px] font-black text-text-primary">LKR {(item.price * (item.q || 1)).toFixed(0)}</span>
                             </div>
                          ))}
                       </div>
                       <div className="flex justify-between items-end border-t-2 border-black/5 pt-4 mt-4">
                          <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">Total Payable</span>
                          <span className="text-xl font-black text-brand tracking-tighter">LKR {total}</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-3 bg-white border border-border rounded-2xl"><QrCode className="w-16 h-16 text-text-primary" /></div>
                       <span className="text-[7px] font-black text-text-disabled uppercase tracking-[0.3em] text-center leading-loose">PRESENT AT POOJA COUNTER</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-12 p-6 bg-[#111] text-white rounded-3xl w-full text-center space-y-4 animate-in zoom-in-95 duration-700 delay-500">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-brand">Instructions</h3>
              <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">
                 {payMethod === "cash" 
                   ? "Take this voucher to Counter 1. After payment, you will receive your pooja items."
                   : "Take this voucher directly to the Pooja Item collection center."}
              </p>
           </div>
        </div>
        <footer className="p-8 bg-white border-t border-border fixed bottom-0 left-0 w-full z-20">
           <Link href="/kiosk" onClick={() => localStorage.removeItem("kiosk_cart")}>
              <button className="w-full h-14 bg-[#111] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><Home className="w-4 h-4" />Return to Start</button>
           </Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB] overflow-hidden select-none relative">
      <header className="bg-[#111] pt-12 pb-8 px-8 text-center shadow-2xl relative z-30">
        <h1 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-1">Omkaarya</h1>
        <p className="text-[8px] font-black text-brand uppercase tracking-[0.5em] opacity-80">Payment Terminal</p>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
         <div className="text-center animate-in zoom-in-95 duration-700">
            <span className="text-[8px] font-black text-text-tertiary uppercase tracking-[0.4em] mb-4 block">Amount Payable</span>
            <div className="text-6xl font-black text-brand tracking-tighter drop-shadow-2xl">LKR {total}</div>
         </div>

         <div className="space-y-4">
            <h3 className="text-[8px] font-black text-text-tertiary uppercase tracking-[0.4em] ml-2">Choose Payment Method</h3>
            
            {/* CARD OPTION */}
            <button onClick={() => handleFinish("card")} className="w-full h-20 bg-white border-2 border-border/50 hover:border-brand rounded-[24px] flex items-center px-8 gap-6 active:scale-95 transition-all group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-brand/5 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors"><CreditCard className="w-5 h-5" /></div>
               <div className="text-left">
                  <div className="text-[11px] font-black text-text-primary uppercase tracking-tight">Card Payment</div>
                  <div className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5">Instant Ticket Activation</div>
               </div>
            </button>

            {/* CASH OPTION */}
            <button onClick={() => handleFinish("cash")} className="w-full h-20 bg-white border-2 border-border/50 hover:border-brand rounded-[24px] flex items-center px-8 gap-6 active:scale-95 transition-all group shadow-sm">
               <div className="w-10 h-10 rounded-xl bg-brand/5 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors"><Coins className="w-5 h-5" /></div>
               <div className="text-left">
                  <div className="text-[11px] font-black text-text-primary uppercase tracking-tight">Cash at Counter</div>
                  <div className="text-[8px] text-text-tertiary font-bold uppercase tracking-widest mt-0.5">Pay at Counter 1 to Activate</div>
               </div>
            </button>
         </div>

         <div className="bg-subtle p-6 rounded-3xl border border-border/40">
            <div className="flex justify-between items-center opacity-50">
               <span className="text-[9px] font-black uppercase tracking-widest">Total Unit(s)</span>
               <span className="text-[10px] font-black">{cart.length}</span>
            </div>
         </div>
      </div>

      <footer className="p-8 bg-white border-t border-border">
         <Link href="/kiosk/select"><button className="w-full h-12 bg-subtle text-text-primary rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 active:scale-90 transition-all"><ChevronLeft className="w-4 h-4" /> Edit Selection</button></Link>
      </footer>
    </div>
  );
}
