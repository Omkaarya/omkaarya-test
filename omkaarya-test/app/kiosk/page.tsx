"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function KioskAttractPage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-between py-16 px-8 text-white">
      {/* ─── Background Image Placeholder ───────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />
        {/* Placeholder for Deity Image */}
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1600100397608-f010e6245100?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      </div>

      {/* ─── Top: Branding ───────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
          <span className="text-3xl font-bold">ॐ</span>
        </div>
        <h1 className="text-xl font-bold tracking-[0.2em] uppercase opacity-90">Omkaarya</h1>
      </div>

      {/* ─── Center: Clock ───────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center text-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-[40px] border border-white/20 px-12 py-10 shadow-2xl">
          <div className="text-7xl font-bold tracking-tight mb-2">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm font-bold uppercase tracking-widest opacity-60">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ─── Bottom: Action ──────────────────────────────────────────── */}
      <div className="relative z-20 w-full">
        <Link href="/kiosk/select">
          <button className="w-full group relative overflow-hidden bg-brand h-24 rounded-3xl shadow-[0_0_50px_rgba(255,72,0,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="text-2xl font-black uppercase tracking-widest">Tap to Start</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </Link>
        <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
          Self-Service Terminal • v1.0
        </p>
      </div>
    </div>
  );
}
