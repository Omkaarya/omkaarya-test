"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import {
  fetchTempleAdminJson,
  type Devotee,
  type PoojaSeva,
} from "@/lib/temple-admin-api";

export default function NewBookingPage() {
  const router = useRouter();
  const [sevas, setSevas] = useState<PoojaSeva[]>([]);
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [poojaSevaId, setPoojaSevaId] = useState<string>("");
  const [poojaName, setPoojaName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [priest, setPriest] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("INR");
  const [notes, setNotes] = useState<string>("");
  const [source, setSource] = useState<string>("walk_in");
  const [devoteeId, setDevoteeId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid" | "partial">("unpaid");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sevasRes, devoteesRes] = await Promise.all([
          fetchTempleAdminJson<{ items: PoojaSeva[] }>("/api/temple-admin/master/pooja-sevas"),
          fetchTempleAdminJson<{ items: Devotee[] }>("/api/temple-admin/devotees"),
        ]);
        if (!cancelled) {
          setSevas(sevasRes.items ?? []);
          setDevotees(devoteesRes.items ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load form data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSeva = useMemo(() => sevas.find((s) => s.id === poojaSevaId), [sevas, poojaSevaId]);

  useEffect(() => {
    if (selectedSeva) {
      setPoojaName(selectedSeva.name);
      if (!amount) setAmount(String(selectedSeva.price_amount ?? ""));
      if (!duration && selectedSeva.duration_minutes) setDuration(String(selectedSeva.duration_minutes));
      if (!priest && selectedSeva.priest_name) setPriest(selectedSeva.priest_name);
      if (selectedSeva.currency) setCurrency(selectedSeva.currency);
    }
  }, [selectedSeva]);

  const handleSave = async () => {
    if (!poojaName.trim() || !date || !time) {
      setError("Pooja name, date and time are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const reference = `BK-${Date.now().toString(36).toUpperCase()}`;
      await fetchTempleAdminJson("/api/temple-admin/bookings", {
        method: "POST",
        body: JSON.stringify({
          reference,
          poojaSevaId: poojaSevaId || null,
          devoteeId: devoteeId || null,
          poojaName: poojaName.trim(),
          scheduledAt,
          durationMinutes: duration ? Number(duration) : null,
          priestName: priest.trim() || null,
          amountTotal: amount ? Number(amount) : 0,
          currency,
          paymentStatus,
          status: "pending",
          notes: notes.trim() || null,
          source: source || null,
        }),
      });
      router.push("/temple-admin/bookings");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save booking.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 outline-none font-[inherit] w-full transition-colors focus:border-[var(--brand-primary)]";
  const formSelectClass = "!text-xs !py-2 !rounded-lg !font-[inherit]";
  const labelCls = "text-[11px] font-semibold text-zinc-600 dark:text-zinc-400";

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Create New Booking</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Schedule a pooja or seva for a devotee.
          </p>
        </div>
        <button
          onClick={() => router.push("/temple-admin/bookings")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to List
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-sm text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5">
          <div>
            <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-3">Service details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  Pooja / Seva <span className="text-[var(--brand-primary)]">*</span>
                </label>
                <SelectInput
                  className={formSelectClass}
                  value={poojaSevaId}
                  onChange={(e) => setPoojaSevaId(e.target.value)}
                >
                  <option value="">Select from master list (or type below)</option>
                  {sevas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  Pooja Name <span className="text-[var(--brand-primary)]">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Pooja name shown to devotee"
                  value={poojaName}
                  onChange={(e) => setPoojaName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  Date <span className="text-[var(--brand-primary)]">*</span>
                </label>
                <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  Time <span className="text-[var(--brand-primary)]">*</span>
                </label>
                <input className={inputCls} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Priest</label>
                <input
                  className={inputCls}
                  placeholder="Assigned priest"
                  value={priest}
                  onChange={(e) => setPriest(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Duration (minutes)</label>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-3">Payment</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Amount</label>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Currency</label>
                <input
                  className={inputCls}
                  maxLength={8}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Payment status</label>
                <SelectInput
                  className={formSelectClass}
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </SelectInput>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-50 mb-3">Devotee</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Devotee</label>
                <SelectInput
                  className={formSelectClass}
                  value={devoteeId}
                  onChange={(e) => setDevoteeId(e.target.value)}
                >
                  <option value="">No linked devotee</option>
                  {devotees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                      {d.phone ? ` · ${d.phone}` : ""}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Source</label>
                <SelectInput
                  className={formSelectClass}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="walk_in">Walk-in</option>
                  <option value="online">Online</option>
                  <option value="phone">Phone</option>
                  <option value="staff">Staff</option>
                </SelectInput>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Notes</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requirements, prasadham notes, etc."
            />
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 rounded-lg bg-[var(--brand-primary)] text-[13px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => router.push("/temple-admin/bookings")}
              className="px-6 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
