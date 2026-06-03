"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  X,
  Info,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import SelectInput from "@/app/components/admin/SelectInput";
import {
  fetchTempleAdminJson,
  type Festival,
  type PanchangamEntry,
  type PoojaSeva,
  type Schedule,
} from "@/lib/temple-admin-api";

type MasterTab = "seva" | "schedule" | "festival" | "panch";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<MasterTab>("seva");
  const [activeModal, setActiveModal] = useState<"seva" | "schedule" | "festival" | "panch" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sevas, setSevas] = useState<PoojaSeva[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [panchangam, setPanchangam] = useState<PanchangamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s1, s2, s3, s4] = await Promise.all([
        fetchTempleAdminJson<{ items: PoojaSeva[] }>("/api/temple-admin/master/pooja-sevas"),
        fetchTempleAdminJson<{ items: Schedule[] }>("/api/temple-admin/master/schedules"),
        fetchTempleAdminJson<{ items: Festival[] }>("/api/temple-admin/master/festivals"),
        fetchTempleAdminJson<{ items: PanchangamEntry[] }>("/api/temple-admin/master/panchangam"),
      ]);
      setSevas(s1.items);
      setSchedules(s2.items);
      setFestivals(s3.items);
      setPanchangam(s4.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load master data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const deleteRow = async (kind: MasterTab, id: string) => {
    const path = {
      seva: "pooja-sevas",
      schedule: "schedules",
      festival: "festivals",
      panch: "panchangam",
    }[kind];
    if (!confirm("Delete this entry?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/master/${path}/${id}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage temple-specific master data (Pooja, Schedules, Festivals, Panchangam)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setActiveModal(activeTab)}>
          <Plus className="h-4 w-4" /> Add{" "}
          {activeTab === "seva" ? "Pooja Seva" : activeTab === "schedule" ? "Schedule" : activeTab === "festival" ? "Festival" : "Panchangam"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        <TabButton active={activeTab === "seva"} onClick={() => setActiveTab("seva")} label={`Pooja & Seva (${sevas.length})`} />
        <TabButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} label={`Schedules (${schedules.length})`} />
        <TabButton active={activeTab === "festival"} onClick={() => setActiveTab("festival")} label={`Festivals (${festivals.length})`} />
        <TabButton active={activeTab === "panch"} onClick={() => setActiveTab("panch")} label={`Panchangam (${panchangam.length})`} />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            {activeTab === "seva" && <SevaTable data={sevas} onDelete={(id) => deleteRow("seva", id)} />}
            {activeTab === "schedule" && <ScheduleTable data={schedules} onDelete={(id) => deleteRow("schedule", id)} />}
            {activeTab === "festival" && <FestivalTable data={festivals} onDelete={(id) => deleteRow("festival", id)} />}
            {activeTab === "panch" && <PanchTable data={panchangam} onDelete={(id) => deleteRow("panch", id)} />}
          </>
        )}
      </div>

      {activeModal === "seva" && (
        <AddSevaModal onClose={() => setActiveModal(null)} onSaved={async () => { setActiveModal(null); await reload(); }} />
      )}
      {activeModal === "schedule" && (
        <AddScheduleModal sevas={sevas} onClose={() => setActiveModal(null)} onSaved={async () => { setActiveModal(null); await reload(); }} />
      )}
      {activeModal === "festival" && (
        <AddFestivalModal onClose={() => setActiveModal(null)} onSaved={async () => { setActiveModal(null); await reload(); }} />
      )}
      {activeModal === "panch" && (
        <AddPanchModal onClose={() => setActiveModal(null)} onSaved={async () => { setActiveModal(null); await reload(); }} />
      )}
    </div>
  );
}

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

function SevaTable({ data, onDelete }: { data: PoojaSeva[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva Name</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Duration</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Price</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="min-w-0 overflow-hidden px-6 py-4">
                <TruncateText className="font-bold" title={item.name}>
                  {item.name}
                </TruncateText>
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{item.category || "—"}</td>
              <td className="px-6 py-4 text-center">
                {item.duration_minutes ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 px-2 py-0.5 text-[10px] font-bold dark:bg-zinc-900">
                    <Clock className="h-3 w-3" /> {item.duration_minutes} min
                  </span>
                ) : "—"}
              </td>
              <td className="px-6 py-4 font-bold text-[var(--brand-primary)]">{item.currency} {Number(item.price_amount).toFixed(2)}</td>
              <td className={`px-6 py-4 text-xs font-bold uppercase ${item.is_active ? "text-green-600" : "text-zinc-400"}`}>
                {item.is_active ? "Active" : "Inactive"}
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">No pooja sevas yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ data, onDelete }: { data: Schedule[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Days</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Time</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Priest</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Slots</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="min-w-0 overflow-hidden px-6 py-4">
                <TruncateText className="font-bold" title={item.pooja_name}>
                  {item.pooja_name}
                </TruncateText>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {item.days.map((day) => (
                    <span key={day} className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/20">{day}</span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 font-bold">{item.time_of_day ?? "—"}</td>
              <td className="px-6 py-4 text-sm font-medium">{item.priest_name ?? "—"}</td>
              <td className="px-6 py-4 text-xs font-bold">{item.max_slots ?? "—"} {item.max_slots ? "slots" : ""}</td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">No schedules yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function FestivalTable({ data, onDelete }: { data: Festival[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Festival Name</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="min-w-0 overflow-hidden px-6 py-4">
                <TruncateText className="font-bold" title={item.name}>
                  {item.name}
                </TruncateText>
                {item.description ? (
                  <TruncateText className="text-[10px] text-[var(--text-muted)]" title={item.description}>
                    {item.description}
                  </TruncateText>
                ) : null}
              </td>
              <td className="px-6 py-4 font-bold">{item.festival_date ?? "—"}</td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[var(--brand-primary)] dark:bg-orange-950/20">
                  {item.category || "—"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-zinc-400">No festivals yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function PanchTable({ data, onDelete }: { data: PanchangamEntry[]; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Festival / Day</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Auspicious Type</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {data.map((item) => (
            <tr key={item.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4 font-mono text-sm">{item.panch_date}</td>
              <td className="min-w-0 overflow-hidden px-6 py-4">
                <TruncateText className="font-bold" title={item.festival_label ?? undefined}>
                  {item.festival_label ?? "—"}
                </TruncateText>
                {item.type_label ? (
                  <TruncateText className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]" title={item.type_label}>
                    {item.type_label}
                  </TruncateText>
                ) : null}
              </td>
              <td className="px-6 py-4">
                {item.auspicious_label ? (
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${item.auspicious_label.toLowerCase().includes("highly") ? "text-green-600" : "text-blue-500"}`}>
                    <Info className="h-3 w-3" /> {item.auspicious_label}
                  </span>
                ) : "—"}
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-zinc-400">No panchangam entries yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddSevaModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/master/pooja-sevas", {
        method: "POST",
        body: JSON.stringify({
          name,
          category,
          durationMinutes: duration ? Number(duration) : null,
          priceAmount: price ? Number(price) : 0,
          currency,
          description: description || null,
        }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add New Pooja Seva" subtitle="Create a pooja seva item for the master catalogue" onClose={onClose}>
      <div className="p-6 space-y-4">
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Duration (min)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Price *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Currency</label>
            <SelectInput value={currency} onChange={(e) => setCurrency(e.target.value)} className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900">
              <option>INR</option><option>USD</option><option>EUR</option><option>CHF</option><option>GBP</option><option>LKR</option>
            </SelectInput>
          </div>
        </div>
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-zinc-100 p-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
        <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
        <Button onClick={submit} disabled={saving || !name.trim()} className="rounded-xl px-8 font-bold">
          {saving ? "Saving…" : "Save Seva"}
        </Button>
      </div>
    </ModalShell>
  );
}

function AddScheduleModal({ sevas, onClose, onSaved }: { sevas: PoojaSeva[]; onClose: () => void; onSaved: () => void }) {
  const [poojaSevaId, setPoojaSevaId] = useState<string>("");
  const [poojaName, setPoojaName] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [priestName, setPriestName] = useState("");
  const [maxSlots, setMaxSlots] = useState("");
  const [cutoff, setCutoff] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggleDay = (d: string) => setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const submit = async () => {
    const seva = sevas.find((s) => s.id === poojaSevaId);
    const finalName = seva?.name ?? poojaName.trim();
    if (!finalName) return;
    setSaving(true);
    setErr(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/master/schedules", {
        method: "POST",
        body: JSON.stringify({
          poojaSevaId: poojaSevaId || null,
          poojaName: finalName,
          days,
          timeOfDay: timeOfDay || null,
          priestName: priestName || null,
          maxSlots: maxSlots ? Number(maxSlots) : null,
          cutoffHours: cutoff ? Number(cutoff) : null,
          isActive: true,
        }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add Pooja Schedule" subtitle="Set recurring pooja schedule for this temple" onClose={onClose}>
      <div className="p-6 space-y-4">
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pooja Seva *</label>
          <SelectInput value={poojaSevaId} onChange={(e) => setPoojaSevaId(e.target.value)} className="!h-11 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 dark:!border-zinc-800 dark:!bg-zinc-900">
            <option value="">Select pooja…</option>
            {sevas.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectInput>
        </div>
        {!poojaSevaId && (
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Or enter pooja name</label>
            <input value={poojaName} onChange={(e) => setPoojaName(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        )}
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Days</label>
          <div className="flex flex-wrap gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Daily"].map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${days.includes(d) ? "bg-[var(--brand-primary)] text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Time *</label>
            <input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Priest</label>
            <input value={priestName} onChange={(e) => setPriestName(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Max Slots</label>
            <input type="number" value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cutoff (hrs)</label>
            <input type="number" value={cutoff} onChange={(e) => setCutoff(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
        <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
        <Button onClick={submit} disabled={saving} className="rounded-xl px-8 font-bold">
          {saving ? "Saving…" : "Save Schedule"}
        </Button>
      </div>
    </ModalShell>
  );
}

function AddFestivalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/master/festivals", {
        method: "POST",
        body: JSON.stringify({ name, festivalDate: date || null, category, description: description || null, isActive: true }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add Festival" subtitle="Add a festival/special day to the temple calendar" onClose={onClose}>
      <div className="p-6 space-y-4">
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Festival Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-zinc-100 p-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
        <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
        <Button onClick={submit} disabled={saving || !name.trim()} className="rounded-xl px-8 font-bold">{saving ? "Saving…" : "Save Festival"}</Button>
      </div>
    </ModalShell>
  );
}

function AddPanchModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [date, setDate] = useState("");
  const [festivalLabel, setFestivalLabel] = useState("");
  const [typeLabel, setTypeLabel] = useState("");
  const [auspiciousLabel, setAuspiciousLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!date) return;
    setSaving(true);
    setErr(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/master/panchangam", {
        method: "POST",
        body: JSON.stringify({ panchDate: date, festivalLabel: festivalLabel || null, typeLabel: typeLabel || null, auspiciousLabel: auspiciousLabel || null }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title="Add Panchangam Entry" subtitle="Record an auspicious day or festival" onClose={onClose}>
      <div className="p-6 space-y-4">
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
        <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Festival / Day Label</label>
          <input value={festivalLabel} onChange={(e) => setFestivalLabel(e.target.value)} className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Type</label>
            <input value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)} placeholder="e.g. Hindu Festival" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Auspicious Label</label>
            <input value={auspiciousLabel} onChange={(e) => setAuspiciousLabel(e.target.value)} placeholder="e.g. Highly Auspicious" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30">
        <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
        <Button onClick={submit} disabled={saving || !date} className="rounded-xl px-8 font-bold">{saving ? "Saving…" : "Save Entry"}</Button>
      </div>
    </ModalShell>
  );
}
