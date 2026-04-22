"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Minus, Trash2, Search, Maximize2,
  Cookie, Droplets, CircleDot, Leaf, Flower2, Circle, CupSoda,
  Sparkles, Wheat, Flame, Soup,
  X, Phone, Calendar as CalIcon, User,
} from "lucide-react";

// ── Prasadham items ────────────────────────────────────────────────

const PRASAD = [
  { name: "Ladoo", Icon: Cookie },
  { name: "Panchamrit", Icon: Droplets },
  { name: "Coconut", Icon: CircleDot },
  { name: "Banana", Icon: Leaf },
  { name: "Rose Garland", Icon: Flower2 },
  { name: "Kumkum", Icon: Circle },
  { name: "Besan Ladoo", Icon: Cookie },
  { name: "Payasam", Icon: CupSoda },
  { name: "Vibhuti", Icon: Sparkles },
  { name: "Pori", Icon: Wheat },
  { name: "Peanuts", Icon: Flame },
  { name: "Sundal", Icon: Soup },
];

type FamilyMember = { name: string; nakshatra: string };

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>{msg}</div>;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [toast, setToast] = useState({ msg: "", show: false });
  const showToast = (msg: string) => { setToast({ msg, show: true }); setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500); };

  // Prasad state
  const [prasadEnabled, setPrasadEnabled] = useState(true);
  const [prasadCounts, setPrasadCounts] = useState<number[]>(PRASAD.map((_, i) => i === 0 ? 1 : 0));
  const changePrasad = (i: number, d: number) => setPrasadCounts(prev => prev.map((v, idx) => idx === i ? Math.max(0, v + d) : v));

  // Ubhayam / devotee state
  const [showDevotee, setShowDevotee] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([
    { name: "migan", nakshatra: "" },
    { name: "migan", nakshatra: "" },
    { name: "migan", nakshatra: "" },
  ]);
  const addMember = () => setMembers(prev => [...prev, { name: "", nakshatra: "" }]);
  const delMember = (i: number) => setMembers(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => { showToast("Booking saved successfully!"); setTimeout(() => router.push("/temple-admin/bookings"), 700); };

  const inputCls = "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const selectCls = inputCls + " cursor-pointer";
  const labelCls = "text-[11px] font-semibold text-zinc-600 dark:text-zinc-400";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create New Booking</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Create and manage new bookings here</p>
        </div>
        <button onClick={() => router.push("/temple-admin/bookings")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Back to List
        </button>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-4">Basic Info</div>
            <div className="grid grid-cols-4 gap-3.5 mb-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Pooja Festival Name <span className="text-[var(--brand-primary)]">*</span></label>
                <input className={inputCls} placeholder="enter pooja festival name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Category <span className="text-[var(--brand-primary)]">*</span></label>
                <select className={selectCls}>
                  <option value="">Select one</option>
                  <option>Nithya Seva Pooja</option><option>Monthly Pooja</option><option>Special Pooja</option>
                  <option>Annual Festival</option><option>Nerthi Parihara Pooja</option><option>Utchavam</option>
                  <option>Mahotchavam</option><option>Viradham</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Date <span className="text-[var(--brand-primary)]">*</span></label>
                <input className={inputCls} type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Time <span className="text-[var(--brand-primary)]">*</span></label>
                <input className={inputCls} type="time" defaultValue="09:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Price <span className="text-[var(--brand-primary)]">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">$</span>
                  <input className={inputCls + " pl-6"} type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-3.5">
              <label className={labelCls}>Description</label>
              <textarea className={inputCls + " resize-none"} rows={3} placeholder="Enter a description..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ── Offering Prashadham ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-3 mb-3">
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Offering Prashadham</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">This pooja are you giving prasadham</div>
                </div>
                <button onClick={() => setPrasadEnabled(!prasadEnabled)} className={`relative w-[38px] h-5 rounded-full transition-colors ${prasadEnabled ? "bg-[var(--brand-primary)]" : "bg-zinc-300 dark:bg-zinc-600"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${prasadEnabled ? "left-[19px]" : "left-0.5"}`} />
                </button>
              </div>

              {prasadEnabled && (
                <>
                  <div className={labelCls + " mb-2"}>Select Prashadham <span className="text-[var(--brand-primary)]">*</span></div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PRASAD.map((p, i) => {
                      const count = prasadCounts[i];
                      const sel = count > 0;
                      return (
                        <div key={i} className={`rounded-xl border-[1.5px] p-3 text-center cursor-pointer transition-all relative ${sel ? "border-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/20" : "border-zinc-200 dark:border-zinc-700 hover:border-orange-200"}`}>
                          <div className="w-[42px] h-[42px] mx-auto mb-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400"><p.Icon className="w-5 h-5" /></div>
                          <div className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{p.name}</div>
                          <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <button onClick={e => { e.stopPropagation(); changePrasad(i, -1); }} className="w-[22px] h-[22px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-[16px] text-center">{count}</span>
                            <button onClick={e => { e.stopPropagation(); changePrasad(i, 1); }} className="w-[22px] h-[22px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ── Enable Ubhayam ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3.5 py-3 mb-3">
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Enable Ubhayam booking</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">This pooja are having ubhayam.</div>
                </div>
                <div className="relative w-[38px] h-5 rounded-full bg-[var(--brand-primary)]"><div className="absolute top-0.5 left-[19px] w-4 h-4 rounded-full bg-white" /></div>
              </div>

              {/* Devotee search */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <input placeholder="Select a devotee" className="border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 bg-transparent w-full font-[inherit] placeholder:text-zinc-400" />
                </div>
                <button onClick={() => showToast("Creating new devotee...")} className="inline-flex items-center gap-1 px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Plus className="w-3 h-3" />Create</button>
                <button className="w-[34px] h-[34px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shrink-0"><Maximize2 className="w-3.5 h-3.5" /></button>
              </div>

              {/* Devotee result card */}
              {showDevotee && (
                <div className="bg-orange-50 dark:bg-orange-950/20 border-[1.5px] border-orange-200 dark:border-orange-800/50 rounded-xl px-3.5 py-3 mb-3 relative">
                  <button onClick={() => setShowDevotee(false)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                  <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">James Anderson</div>
                  <div className="text-[11px] text-zinc-500">3 family members</div>
                  <div className="flex gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500"><CalIcon className="w-3 h-3" />2001</div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500"><Phone className="w-3 h-3" />+94 76 5432100</div>
                  </div>
                  <button className="absolute right-3 bottom-3 px-3 py-1.5 bg-[var(--brand-primary)] text-white text-[11px] font-semibold rounded-lg hover:bg-[var(--brand-primary-hover)] transition-colors">Apply</button>
                </div>
              )}

              {/* Gothram */}
              <div className="flex flex-col gap-1.5 mb-3">
                <label className={labelCls}>Gothram</label>
                <select className={selectCls}>
                  <option value="">Select one</option><option>Bharadwaja</option><option>Kashyapa</option><option>Vatsa</option><option>Atreya</option>
                </select>
              </div>

              {/* Family members */}
              <div className="space-y-2.5">
                {members.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_26px] gap-2 items-end">
                    <div className="flex flex-col gap-1">
                      {i === 0 && <label className={labelCls}>Full Name</label>}
                      <input className={inputCls} placeholder="Full name" defaultValue={m.name} />
                    </div>
                    <div className="flex flex-col gap-1">
                      {i === 0 && <label className={labelCls}>Nakshatra & Rasi</label>}
                      <select className={selectCls}>
                        <option value="">Select one</option>
                        <option>Ashwini — Mesha</option><option>Bharani — Mesha</option>
                        <option>Krittika — Mesha/Vrishabha</option><option>Rohini — Vrishabha</option>
                        <option>Mrigashira — Vrishabha/Mithuna</option><option>Ardra — Mithuna</option>
                      </select>
                    </div>
                    <button onClick={() => delMember(i)} className="w-[26px] h-9 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={addMember} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] mt-3 hover:opacity-80">
                <Plus className="w-3.5 h-3.5" />Add New
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={handleSave} className="px-8 py-2.5 rounded-lg bg-[var(--brand-primary)] text-[13px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">Save</button>
            <button onClick={() => router.push("/temple-admin/bookings")} className="px-6 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Cancel</button>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR — Note ── */}
        <div className="sticky top-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 relative">
            {/* Left arrow for callout */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[8px] border-r-zinc-200 dark:border-r-zinc-700" />
            <div className="absolute -left-[6px] top-[17px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[7px] border-r-white dark:border-r-zinc-900" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">Pooja Cate Hardcoded</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2.5">Here are the Default pooja category</p>
            <ul className="space-y-1">
              {["Nithya Seva Pooja", "Monthly Pooja", "Special Pooja", "Annual Festival", "Nerthi Parihara Pooja", "Utchavam", "Mahotchavam", "Viradham"].map(cat => (
                <li key={cat} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                  <span className="text-[var(--brand-primary)] mt-px shrink-0">•</span>{cat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
