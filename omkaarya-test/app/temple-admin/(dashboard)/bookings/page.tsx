"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, Loader2, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { fetchTempleAdminJson, type Booking } from "@/lib/temple-admin-api";

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-1">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{value}</h3>
        <span className="text-[10px] font-bold text-zinc-400">{sub}</span>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export default function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Booking["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: Booking[] }>("/api/temple-admin/bookings");
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      const matchSearch =
        !q ||
        b.reference.toLowerCase().includes(q) ||
        b.pooja_name.toLowerCase().includes(q) ||
        (b.devotee_name ?? "").toLowerCase().includes(q);
      const matchTab = activeTab === "all" || b.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [items, search, activeTab]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      total: items.length,
      today: items.filter((b) => {
        const t = new Date(b.scheduled_at);
        return t >= today && t < tomorrow;
      }).length,
      pending: items.filter((b) => b.status === "pending").length,
    };
  }, [items]);

  const transition = async (id: string, status: Booking["status"]) => {
    try {
      await fetchTempleAdminJson(`/api/temple-admin/bookings/${encodeURIComponent(id)}/transition`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update booking.");
    }
  };

  const tabs: { id: "all" | Booking["status"]; label: string }[] = [
    { id: "all", label: "All Bookings" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="TOTAL SEVAS" value={String(stats.total)} sub="all time" />
        <MetricCard title="TODAY" value={String(stats.today).padStart(2, "0")} sub="scheduled" />
        <MetricCard title="PENDING" value={String(stats.pending).padStart(2, "0")} sub="requests" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Bookings &amp; Schedules</h2>
            <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-[10px] font-bold text-orange-600 border border-orange-100 dark:border-orange-800">
              {items.length} Bookings
            </span>
          </div>
          <Link href="/temple-admin/bookings/new">
            <Button leadingIcon={<Plus className="w-4 h-4" />}>New Booking</Button>
          </Link>
        </div>

        <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-zinc-900">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10"
              placeholder="Search by reference, pooja, or devotee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-zinc-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-sm text-zinc-500">
              {items.length === 0 ? "No bookings yet." : "No bookings match your filters."}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-50 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pooja / Seva</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Devotee</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-5 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">
                      {b.reference}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 border border-blue-100">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{b.pooja_name}</div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{b.source ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-zinc-900 dark:text-white">{b.devotee_name ?? "—"}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{b.priest_name ?? ""}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {new Date(b.scheduled_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(b.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-emerald-600">
                        {b.currency === "INR" ? "₹" : ""}
                        {Number(b.amount_total).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={STATUS_LABEL[b.status]} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === "pending" && (
                          <button
                            onClick={() => transition(b.id, "confirmed")}
                            className="p-2 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                            title="Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <button
                            onClick={() => transition(b.id, "cancelled")}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
