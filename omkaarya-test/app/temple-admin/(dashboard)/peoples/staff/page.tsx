"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { fetchTempleAdminJson, type StaffMember } from "@/lib/temple-admin-api";

function MetricCard({ title, value, sub }: { title: string; value: number | string; sub: string }) {
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

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: StaffMember[] }>("/api/temple-admin/peoples/staff");
      setStaff(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load staff.");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/peoples/staff/${id}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove staff member.");
    }
  };

  const filtered = staff.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.trim().toLowerCase();
    const matchSearch = !search.trim() ||
      fullName.includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || s.status === activeTab;
    return matchSearch && matchTab;
  });

  const totals = {
    total: staff.length,
    active: staff.filter((s) => s.status === "active").length,
    pending: staff.filter((s) => s.status === "pending").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="STAFF SEATS" value={totals.total} sub="all time" />
        <MetricCard title="ACTIVE NOW" value={totals.active} sub="on duty" />
        <MetricCard title="PENDING" value={totals.pending} sub="awaiting activation" />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Staff Directory</h2>
            <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 text-[10px] font-bold text-orange-600 border border-orange-100 dark:border-orange-800">
              {staff.length} Staff
            </span>
          </div>
          <Link href="/temple-admin/peoples/staff/new">
            <Button leadingIcon={<UserPlus className="w-4 h-4" />}>Create Staff</Button>
          </Link>
        </div>

        <div className="px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-zinc-900">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-x-auto">
            {(["all", "active", "inactive", "pending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap capitalize transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-md" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
              >
                {tab === "all" ? "All Staff" : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading staff…
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950 border-y border-zinc-50 dark:border-zinc-800">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Staff</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Joined</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[10px] font-black text-orange-600 border border-orange-100">
                          {s.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                            {s.first_name} {s.last_name}
                          </div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/30 text-[10px] font-bold text-purple-600 border border-purple-100 dark:border-purple-900">
                        {s.role_name ?? "Unassigned"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {s.joined_at ?? "—"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={s.status.charAt(0).toUpperCase() + s.status.slice(1)} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-sm text-zinc-400">
                      No staff members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-8 py-5 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30 border-t border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Showing {filtered.length} of {staff.length}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-md">1</div>
            <button className="px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-600 flex items-center gap-1.5">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
