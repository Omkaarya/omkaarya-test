"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, LayoutList, LayoutGrid,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAY_NAMES = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: { date: number; month: number; current: boolean }[] = [];
  const startDay = (first.getDay() + 6) % 7;
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) days.push({ date: prevLast - i, month: month - 1, current: false });
  for (let d = 1; d <= last.getDate(); d++) days.push({ date: d, month, current: true });
  const rem = 35 - days.length; // 5 rows
  if (rem > 0) for (let d = 1; d <= rem; d++) days.push({ date: d, month: month + 1, current: false });
  return days;
}

// ── Calendar Events ────────────────────────────────────────────────

type CalEvent = { date: number; label: string; time?: string; cls: string };
type SpecialDay = { date: number; label: string };

const MONTH_EVENTS: CalEvent[] = [
  { date: 2, label: "Poojan_N...", time: "9:00 AM", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  { date: 3, label: "Sangadahara sa...", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { date: 9, label: "Lunc...", time: "12:00 PM", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { date: 12, label: "Pradhosham", cls: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" },
  { date: 16, label: "Amélie...", time: "10:00 AM", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  { date: 23, label: "Amélie...", time: "10:00 AM", cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  { date: 26, label: "Pradhosham", cls: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" },
  { date: 30, label: "All-hands...", time: "4:00 PM", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
];

const SPECIAL_DAYS: SpecialDay[] = [
  { date: 10, label: "Ekadashi Fast" },
  { date: 11, label: "Ekadashi Fast" },
  { date: 14, label: "Amavasai" },
  { date: 25, label: "Ekadashi Fast" },
];

const SIDEBAR_EVENTS = [
  { label: "Friday standup", time: "9:00 AM", color: "bg-[var(--brand-primary)]" },
  { label: "Olivia x Riley", time: "12:00 PM", color: "bg-emerald-500" },
  { label: "Product demo", time: "1:30 PM", color: "bg-blue-500" },
];

const UPCOMING = [
  { label: "Rudrabhishekam", date: "2026 Jul 10 09:00", color: "bg-[var(--brand-primary)]" },
  { label: "Satyanarayan Puja", date: "2026 Jul 12 10:30", color: "bg-emerald-500" },
  { label: "Archana — Rajan Kumar", date: "2026 Jul 14 08:00", color: "bg-blue-500" },
];

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return <div className={`fixed bottom-5 right-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-xs font-medium z-[9999] transition-all duration-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>{msg}</div>;
}

// ── Page ───────────────────────────────────────────────────────────

export default function BookingCalendarPage() {
  const router = useRouter();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July
  const [miniYear, setMiniYear] = useState(2026);
  const [miniMonth, setMiniMonth] = useState(6);
  const [toast, setToast] = useState({ msg: "", show: false });
  const showToast = (msg: string) => { setToast({ msg, show: true }); setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2400); };

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const miniDays = useMemo(() => getMonthDays(miniYear, miniMonth), [miniYear, miniMonth]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(2026); setMonth(6); };

  const miniPrev = () => { if (miniMonth === 0) { setMiniMonth(11); setMiniYear(y => y - 1); } else setMiniMonth(m => m - 1); };
  const miniNext = () => { if (miniMonth === 11) { setMiniMonth(0); setMiniYear(y => y + 1); } else setMiniMonth(m => m + 1); };

  const eventDates = new Set(MONTH_EVENTS.map(e => e.date));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Bookings & Schedules</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">View and manage all pooja bookings</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => router.push("/temple-admin/bookings")} className="p-1.5 rounded-md text-zinc-400 transition-all"><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => router.push("/temple-admin/bookings")} className="p-1.5 rounded-md text-zinc-400 transition-all"><LayoutList className="w-4 h-4" /></button>
          </div>
          <button onClick={() => router.push("/temple-admin/bookings/new")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
            <Plus className="w-3.5 h-3.5" />Add New
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
        <div className="w-[310px] shrink-0 space-y-3.5">
          {/* Mini Calendar */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{MONTHS[miniMonth]} {miniYear}</span>
              <div className="flex gap-1">
                <button onClick={miniPrev} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                <button onClick={miniNext} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {DAYS.map(d => <div key={d} className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 py-1">{d}</div>)}
              {miniDays.map((d, i) => {
                const isToday = d.date === 10 && d.current;
                const hasEvent = d.current && eventDates.has(d.date);
                return (
                  <button key={i} onClick={() => showToast(`Selected ${MONTHS[miniMonth]} ${d.date}`)} className={`w-8 h-8 rounded-full text-[11px] flex items-center justify-center mx-auto relative transition-colors ${!d.current ? "text-zinc-300 dark:text-zinc-700" : isToday ? "bg-[var(--brand-primary)] text-white font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[var(--brand-primary)]"}`}>
                    {d.date}
                    {hasEvent && !isToday && <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--brand-primary)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Event</span>
              <button onClick={() => showToast("Add event")} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">Drag and drop your event or click in the calendar</p>
            <div className="space-y-2">
              {SIDEBAR_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                  <div className={`w-[3px] rounded-full self-stretch min-h-[30px] shrink-0 ${ev.color}`} />
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{ev.label}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5"><Calendar className="w-3 h-3" />{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-[11px] text-[var(--brand-primary)] font-medium mt-2 hover:opacity-80">2 more...</button>
          </div>

          {/* Upcoming */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Upcoming Event</span>
              <span className="text-[10px] font-bold bg-orange-50 dark:bg-orange-950/30 text-[var(--brand-primary)] px-2 py-px rounded-full">15</span>
            </div>
            <div className="space-y-2">
              {UPCOMING.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                  <div className={`w-[3px] rounded-full shrink-0 mt-1 h-9 ${ev.color}`} />
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{ev.label}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5"><Calendar className="w-3 h-3" />{ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-[11px] text-[var(--brand-primary)] font-medium mt-2 hover:opacity-80">2 more...</button>
          </div>
        </div>

        {/* ── MAIN CALENDAR ─────────────────────────────────────── */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{MONTHS[month].slice(0, 3)}</span>
              <div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">{MONTHS[month]} {year} <span className="text-xs font-normal text-zinc-400 ml-1">Week 1</span></div>
                <div className="text-[11px] text-zinc-400">{MONTHS[month].slice(0, 3)} 1, {year} – {MONTHS[month].slice(0, 3)} {new Date(year, month + 1, 0).getDate()}, {year}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><ChevronLeft className="w-3 h-3" /></button>
              <button onClick={goToday} className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Today</button>
              <button onClick={nextMonth} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><ChevronRight className="w-3 h-3" /></button>
              <select className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]"><option>Month view</option><option>Week view</option><option>Day view</option></select>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-700">
            {DAY_NAMES.map(d => <div key={d} className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center py-2.5">{d}</div>)}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const events = d.current ? MONTH_EVENTS.filter(e => e.date === d.date) : [];
              const special = d.current ? SPECIAL_DAYS.find(s => s.date === d.date) : null;
              const isToday = d.date === 10 && d.current;
              return (
                <div key={i} onClick={() => showToast(`${MONTHS[month]} ${d.date}`)} className={`min-h-[110px] border-r border-b border-zinc-100 dark:border-zinc-800 p-1.5 cursor-pointer transition-colors ${i % 7 === 6 ? "border-r-0" : ""} ${!d.current ? "bg-zinc-50/50 dark:bg-zinc-800/10" : isToday ? "bg-orange-50/50 dark:bg-orange-950/10" : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/20"}`}>
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs mb-1 ${!d.current ? "text-zinc-300 dark:text-zinc-600" : isToday ? "bg-[var(--brand-primary)] text-white font-bold" : "text-zinc-500 dark:text-zinc-400"}`}>{d.date}</div>
                  {events.map((ev, ei) => (
                    <div key={ei} className={`${ev.cls} text-[10px] font-medium rounded-md px-1.5 py-0.5 mb-0.5 truncate cursor-pointer`}>
                      {ev.time && <span className="text-[9px] mr-0.5">{ev.time}</span>}{ev.label}
                    </div>
                  ))}
                  {special && <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{special.label}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}
