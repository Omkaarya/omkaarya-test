"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import SelectInput from "@/app/components/admin/SelectInput";

// ── Types ──────────────────────────────────────────────────────────

type MasterTab = "seva" | "schedule" | "festival" | "panch";

// ── Mock Data ──────────────────────────────────────────────────────

const SEVA_DATA = [
  { name: "Rudrabhishekam", cat: "Special Pooja", dur: "45 min", price: "CHF 350", prasad: "Sakkarai Pongal + Besan Ladoo", priest: "Pandit Sharma", online: true, active: true },
  { name: "Archana", cat: "Nithya Seva Pooja", dur: "15 min", price: "CHF 35", prasad: "Vibhuti + Kumkum", priest: "Pandit Ravi", online: true, active: true },
  { name: "Homam", cat: "Special Pooja", dur: "3 hrs", price: "CHF 800", prasad: "Payasam + Pongal", priest: "Swami K.", online: false, active: true },
  { name: "Satyanarayan Puja", cat: "Monthly Pooja", dur: "2 hrs", price: "CHF 450", prasad: "Puri + Halwa", priest: "Pandit Sharma", online: true, active: true },
  { name: "Abhishekam", cat: "Nithya Seva Pooja", dur: "30 min", price: "CHF 150", prasad: "Panchamrit", priest: "Pandit Ravi", online: true, active: true },
];

const SCHEDULE_DATA = [
  { pooja: "Archana", days: ["Mon", "Wed", "Fri"], time: "06:00 AM", priest: "Pandit Ravi", slots: 20, active: true },
  { pooja: "Abhishekam", days: ["Daily"], time: "07:00 AM", priest: "Pandit Sharma", slots: 10, active: true },
  { pooja: "Rudrabhishekam", days: ["Sat", "Sun"], time: "09:00 AM", priest: "Swami K.", slots: 5, active: true },
  { pooja: "Archana (Evening)", days: ["Daily"], time: "06:30 PM", priest: "Pandit Ravi", slots: 30, active: true },
];

const FESTIVAL_DATA = [
  { name: "Thai Pongal", date: "2027-01-14", cat: "Annual Festival", desc: "Harvest festival — rice pongal offering", priest: "All priests", active: true },
  { name: "Shivaratri", date: "2027-02-26", cat: "Special Pooja", desc: "Night-long vigil with Rudrabhishekam", priest: "Pandit Sharma", active: true },
  { name: "Panguni Uthiram", date: "2027-03-28", cat: "Annual Festival", desc: "Procession + special abhishekam", priest: "All priests", active: true },
];

const PANCH_DATA = [
  { date: "2026-01-14", festival: "Pongal / Makar Sankranti", type: "Hindu Festival", auspicious: "Highly Auspicious" },
  { date: "2026-02-17", festival: "Maha Shivaratri", type: "Hindu Festival", auspicious: "Highly Auspicious" },
  { date: "2026-04-14", festival: "Tamil New Year (Chithirai)", type: "Hindu Festival", auspicious: "Highly Auspicious" },
];

// ── Components ─────────────────────────────────────────────────────

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<MasterTab>("seva");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage temple-specific master data (Pooja, Schedules, Festivals)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setActiveModal(activeTab === "seva" ? "seva" : "schedule")}>
          <Plus className="h-4 w-4" /> Add {activeTab === "seva" ? "Pooja Seva" : "Schedule"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        <TabButton active={activeTab === "seva"} onClick={() => setActiveTab("seva")} label="Pooja & Seva" />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} label="Schedules" />
        <TabButton active={activeTab === "festival"} onClick={() => setActiveTab("festival")} label="Pooja Festivals" />
        <TabButton active={activeTab === "panch"} onClick={() => setActiveTab("panch")} label="Panchangam" />
      </div>

      {/* Content Area */}
      <div className="overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {activeTab === "seva" && <SevaTable data={SEVA_DATA} />}
        {activeTab === "schedule" && <ScheduleTable data={SCHEDULE_DATA} />}
        {activeTab === "festival" && <FestivalTable data={FESTIVAL_DATA} />}
        {activeTab === "panch" && <PanchTable data={PANCH_DATA} />}
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-[var(--text-muted)] py-4">
        2024–2026 © Om Kaaryaa All Rights Reserved • Powered By Pepulux
      </footer>

      {/* Modals */}
      {activeModal === "seva" && <AddSevaModal onClose={() => setActiveModal(null)} />}
      {activeModal === "schedule" && <AddScheduleModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${active
        ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
    >
      {label}
    </button>
  );
}

function SevaTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva Name</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Duration</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Price</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item, i) => (
            <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4 font-bold">{item.name}</td>
              <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{item.cat}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 px-2 py-0.5 text-[10px] font-bold dark:bg-zinc-900">
                  <Clock className="h-3 w-3" /> {item.dur}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-[var(--brand-primary)]">{item.price}</td>
              <td className="px-6 py-4 text-xs font-bold uppercase text-green-600">Active</td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Days</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Time</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Priest</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Slots</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item, i) => (
            <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4 font-bold">{item.pooja}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {item.days.map((day: string) => (
                    <span key={day} className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/20">
                      {day}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 font-bold">{item.time}</td>
              <td className="px-6 py-4 text-sm font-medium">{item.priest}</td>
              <td className="px-6 py-4 text-xs font-bold">{item.slots} slots</td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FestivalTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Festival Name</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item, i) => (
            <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4">
                <p className="font-bold">{item.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{item.desc}</p>
              </td>
              <td className="px-6 py-4 font-bold">{item.date}</td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[var(--brand-primary)] dark:bg-orange-950/20">
                  {item.cat}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanchTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Festival / Day</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Auspicious Type</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item, i) => (
            <tr key={i} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4 font-mono text-sm">{item.date}</td>
              <td className="px-6 py-4">
                <p className="font-bold">{item.festival}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{item.type}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${item.auspicious.includes('Highly') ? 'text-green-600' : 'text-blue-500'
                  }`}>
                  <Info className="h-3 w-3" /> {item.auspicious}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modals (Add Seva & Add Schedule) ───────────────────────────────

function AddSevaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Add New Pooja Seva</h2>
            <p className="text-xs text-[var(--text-muted)]">Create a pooja seva item for the master catalogue</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Name *</label><input type="text" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label><SelectInput className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900"><option>Select one</option></SelectInput></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Duration (min)</label><input type="number" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Price *</label><input type="number" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Currency</label><SelectInput className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900"><option>CHF</option></SelectInput></div>
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label><textarea rows={3} className="w-full rounded-xl border border-zinc-100 p-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
          <Button onClick={onClose} className="rounded-xl px-8 font-bold">Save Seva</Button>
        </div>
      </div>
    </div>
  );
}

function AddScheduleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Add Pooja Schedule</h2>
            <p className="text-xs text-[var(--text-muted)]">Set recurring pooja schedule for this temple</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva *</label><SelectInput className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900"><option>Select pooja...</option></SelectInput></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Time *</label><input type="time" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Priest</label><SelectInput className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900"><option>Select priest...</option></SelectInput></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Max Slots</label><input type="number" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cutoff (hrs)</label><input type="number" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" /></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
          <Button onClick={onClose} className="rounded-xl px-8 font-bold">Save Schedule</Button>
        </div>
      </div>
    </div>
  );
}
