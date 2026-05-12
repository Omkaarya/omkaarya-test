"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Calendar, LayoutList, LayoutGrid, Loader2, AlertCircle } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";
import { fetchTempleAdminJson, type Booking } from "@/lib/temple-admin-api";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAY_NAMES = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: { date: number; month: number; year: number; current: boolean }[] = [];
  const startDay = (first.getDay() + 6) % 7;
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: prevLast - i, month: month - 1, year: month === 0 ? year - 1 : year, current: false });
  }
  for (let d = 1; d <= last.getDate(); d++) days.push({ date: d, month, year, current: true });
  const total = Math.ceil(days.length / 7) * 7;
  let nextDay = 1;
  while (days.length < total) {
    days.push({ date: nextDay++, month: month + 1, year: month === 11 ? year + 1 : year, current: false });
  }
  return days;
}

const STATUS_COLORS: Record<Booking["status"], string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  completed: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  no_show: "bg-zinc-50 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300",
};

export default function BookingCalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const from = new Date(year, month, 1).toISOString();
        const to = new Date(year, month + 1, 1).toISOString();
        const data = await fetchTempleAdminJson<{ items: Booking[] }>(
          `/api/temple-admin/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );
        if (!cancelled) setBookings(data.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load bookings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = new Date(b.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return [...bookings]
      .filter((b) => new Date(b.scheduled_at).getTime() >= now && b.status !== "cancelled")
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      .slice(0, 5);
  }, [bookings]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Bookings &amp; Schedules</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Calendar view of all pooja bookings</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => router.push("/temple-admin/bookings")} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700">
              <LayoutList className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md bg-white dark:bg-zinc-900 text-[var(--brand-primary)] shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => router.push("/temple-admin/bookings/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="w-[310px] shrink-0 space-y-3.5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Upcoming bookings</span>
              <span className="text-[10px] font-bold bg-orange-50 dark:bg-orange-950/30 text-[var(--brand-primary)] px-2 py-px rounded-full">
                {upcoming.length}
              </span>
            </div>
            {loading ? (
              <div className="text-[11px] text-zinc-400">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="text-[11px] text-zinc-400">No upcoming bookings.</div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((b) => (
                  <div key={b.id} className="flex items-start gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                    <div className="w-[3px] rounded-full shrink-0 mt-1 h-9 bg-[var(--brand-primary)]" />
                    <div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{b.pooja_name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.scheduled_at).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {MONTHS[month].slice(0, 3)}
              </span>
              <div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {MONTHS[month]} {year}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} this month
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <SelectInput
                defaultValue="Month view"
                wrapperClassName="w-auto min-w-0"
                className="!rounded-lg !px-2.5 !py-1.5 !text-xs !text-zinc-600 dark:!text-zinc-300 !font-[inherit]"
              >
                <option>Month view</option>
              </SelectInput>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-700">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 text-center py-2.5">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {days.map((d, i) => {
                const key = `${d.year}-${d.month}-${d.date}`;
                const events = bookingsByDay.get(key) ?? [];
                const isToday =
                  d.current && d.date === today.getDate() && d.month === today.getMonth() && d.year === today.getFullYear();
                return (
                  <div
                    key={i}
                    className={`min-h-[110px] border-r border-b border-zinc-100 dark:border-zinc-800 p-1.5 transition-colors ${
                      i % 7 === 6 ? "border-r-0" : ""
                    } ${
                      !d.current
                        ? "bg-zinc-50/50 dark:bg-zinc-800/10"
                        : isToday
                          ? "bg-orange-50/50 dark:bg-orange-950/10"
                          : "bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs mb-1 ${
                        !d.current
                          ? "text-zinc-300 dark:text-zinc-600"
                          : isToday
                            ? "bg-[var(--brand-primary)] text-white font-bold"
                            : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {d.date}
                    </div>
                    {events.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        title={`${b.pooja_name} · ${b.devotee_name ?? ""}`}
                        className={`${STATUS_COLORS[b.status]} text-[10px] font-medium rounded-md px-1.5 py-0.5 mb-0.5 truncate`}
                      >
                        <span className="text-[9px] mr-0.5">
                          {new Date(b.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {b.pooja_name}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-[9px] text-zinc-500 px-1 mt-0.5">+{events.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
