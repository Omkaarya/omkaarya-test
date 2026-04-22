"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, LayoutList, LayoutGrid, User, Calendar, Clock,
  ChevronRight, ChevronLeft, ChevronDown, Filter, Eye, Pencil, MoreVertical,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type BookingStatus = "Confirmed" | "Pending" | "Cancelled";
type PaymentStatus = "Paid" | "Not Paid" | "Refunded";
type SourceType = "Walk-in" | "Online";

type Booking = {
  id: string;
  poojaName: string;
  priestName: string;
  devoteeName: string;
  devoteePhone: string;
  date: string;
  time: string;
  amount: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  sourceType: SourceType;
};

// ── Data ───────────────────────────────────────────────────────────

const BOOKINGS: Booking[] = [
  { id: "BK001", poojaName: "108 Sangabhishekam", priestName: "Kamal Sharma", devoteeName: "Lakshmi Devi", devoteePhone: "+91 98765 43210", date: "2026-12-05", time: "06:00 AM", amount: "LKR 1,000.00", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK002", poojaName: "Sathyanarayana Pooja", priestName: "Ramesh Kumar", devoteeName: "Anjali Sharma", devoteePhone: "+91 98076 54321", date: "2026-12-06", time: "07:30 AM", amount: "LKR 1,200.00", paymentStatus: "Not Paid", bookingStatus: "Pending", sourceType: "Online" },
  { id: "BK003", poojaName: "Navagraha Shanti Homam", priestName: "Vijay Singh", devoteeName: "Ravi Prakash", devoteePhone: "+91 81234 55769", date: "2026-12-07", time: "09:00 AM", amount: "LKR 1,500.00", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK004", poojaName: "Ganapathi Homam", priestName: "Meera Joshi", devoteeName: "Vikram Singh", devoteePhone: "+91 97654 32100", date: "2026-12-08", time: "09:00 AM", amount: "LKR 800.00", paymentStatus: "Refunded", bookingStatus: "Cancelled", sourceType: "Online" },
  { id: "BK005", poojaName: "Annual Shraddha Tithi", priestName: "Arun Verma", devoteeName: "Sunita Iyer", devoteePhone: "+91 92345 67890", date: "2026-12-09", time: "10:30 AM", amount: "LKR 2,000.00", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK006", poojaName: "Navagraha Shanti Homam", priestName: "Nitin Mehta", devoteeName: "Kiran Rao", devoteePhone: "+91 93456 79901", date: "2026-12-10", time: "11:00 AM", amount: "LKR 1,100.00", paymentStatus: "Not Paid", bookingStatus: "Pending", sourceType: "Online" },
  { id: "BK007", poojaName: "Veetuk Krithyam", priestName: "Anil Gupta", devoteeName: "Pooja Agarwal", devoteePhone: "+91 94567 89012", date: "2026-12-11", time: "05:00 PM", amount: "LKR 1,300.00", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK008", poojaName: "Kiraga Pravesam", priestName: "Raghav Sharma", devoteeName: "Rita Joshi", devoteePhone: "+91 95678 90123", date: "2026-12-12", time: "12:00 PM", amount: "LKR 1,800.00", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Online" },
  { id: "BK009", poojaName: "Puberty Ceremony Poojas", priestName: "Sanjay Kumar", devoteeName: "Rohan Nayak", devoteePhone: "+91 96789 01234", date: "2026-12-13", time: "01:30 PM", amount: "LKR 900.00", paymentStatus: "Refunded", bookingStatus: "Cancelled", sourceType: "Walk-in" },
];

// ── Badge components ───────────────────────────────────────────────

function BookingBadge({ status }: { status: BookingStatus }) {
  const cls = status === "Confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
    : status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50";
  return <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

function PayBadge({ status }: { status: PaymentStatus }) {
  const cls = status === "Paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : status === "Refunded" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${cls}`}>{status}</span>;
}

function SourceBadge({ type }: { type: SourceType }) {
  const cls = type === "Online" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
    : "bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50";
  return <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${cls}`}>{type}</span>;
}

function initials(name: string) { return name.split(" ").slice(0, 2).map(w => w[0]).join(""); }

// ── Page ───────────────────────────────────────────────────────────

export default function BookingSchedulesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [payFilter, setPayFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BOOKINGS.filter(b => {
      if (sourceFilter && b.sourceType !== sourceFilter) return false;
      if (payFilter && b.paymentStatus !== payFilter) return false;
      if (statusFilter && b.bookingStatus !== statusFilter) return false;
      if (q && !b.poojaName.toLowerCase().includes(q) && !b.devoteeName.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sourceFilter, payFilter, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Bookings & Schedules</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1.5">View and manage all pooja bookings</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 rounded-xl p-1 border border-zinc-200/50 dark:border-zinc-700/50">
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}><LayoutList className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={() => router.push("/temple-admin/bookings/new")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--brand-primary-hover)] transition-colors">
            <Plus className="w-4 h-4" />Add New Booking
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
        <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 min-w-[200px] focus-within:border-[var(--brand-primary)] transition-colors">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search bookings..." className="border-none outline-none text-xs text-[var(--text-primary)] bg-transparent w-full font-[inherit] placeholder:text-[var(--text-muted)]" />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5 ml-2"><Filter className="w-3.5 h-3.5" />Filter By:</span>
        <button className="inline-flex items-center gap-2 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] bg-white dark:bg-zinc-950 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shadow-sm" onClick={() => setSourceFilter(prev => prev ? "" : "Walk-in")}>Source Type <ChevronDown className="w-3.5 h-3.5 opacity-50" /></button>
        <button className="inline-flex items-center gap-2 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] bg-white dark:bg-zinc-950 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors shadow-sm">Priest <ChevronDown className="w-3.5 h-3.5 opacity-50" /></button>
        <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1); }} className="border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] bg-white dark:bg-zinc-950 outline-none cursor-pointer font-[inherit] shadow-sm">
          <option value="">Payment Status</option><option>Paid</option><option>Not Paid</option><option>Refunded</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] bg-white dark:bg-zinc-950 outline-none cursor-pointer font-[inherit] shadow-sm">
          <option value="">Booking Status</option><option>Confirmed</option><option>Pending</option><option>Cancelled</option>
        </select>
        <select className="ml-auto border border-zinc-100 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] bg-zinc-50 dark:bg-zinc-900 outline-none cursor-pointer font-[inherit] shadow-sm border-dashed">
          <option>Sort By: Last 7 Days</option><option>Sort By: Last 30 Days</option><option>Sort By: Date Asc</option>
        </select>
      </div>

      {/* ─── CARD VIEW ─────────────────────────────────────────────── */}
      {viewMode === "card" && (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map(b => (
            <div key={b.id} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer shadow-sm" onClick={() => router.push("/temple-admin/bookings/new")}>
              {/* Top */}
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono font-bold tracking-wider mb-1 uppercase">#{b.id}</div>
                  <div className="text-sm font-black text-[var(--text-primary)] leading-tight">{b.poojaName}</div>
                </div>
                <BookingBadge status={b.bookingStatus} />
              </div>
              {/* Priest */}
              <div className="text-xs font-semibold text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
                <span className="text-orange-400">•</span> Priest: <span className="text-[var(--text-secondary)]">{b.priestName}</span>
              </div>
              {/* Devotee */}
              <div className="flex items-center gap-3 mb-4 rounded-xl border border-zinc-50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-800/50 flex items-center justify-center text-[10px] font-bold text-[var(--brand-primary)] shrink-0">{initials(b.devoteeName)}</div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">{b.devoteeName}</div>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{b.devoteePhone}</div>
                </div>
              </div>
              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-2 pt-3 pb-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Calendar className="w-3.5 h-3.5 text-zinc-400" />{b.date}</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]"><Clock className="w-3.5 h-3.5 text-zinc-400" />{b.time}</div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Amount</div>
                  <div className="text-sm font-black text-[var(--text-primary)]">{b.amount}</div>
                </div>
                <div className="flex gap-2">
                  <PayBadge status={b.paymentStatus} />
                  <SourceBadge type={b.sourceType} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TABLE VIEW ────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                  {["", "Booking ID", "Source Type", "Services", "Date & Time", "Amount", "Devotee Info", "Priest", "Payment", "Booking Status", "Actions"].map(h => (
                    <th key={h} className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-5 py-4 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {filtered.map((b, i) => (
                  <tr key={b.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-5 py-4"><input type="checkbox" className="w-4 h-4 rounded border-zinc-200 dark:border-zinc-700 cursor-pointer accent-[var(--brand-primary)]" /></td>
                    <td className="px-5 py-4 text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-widest text-opacity-80">#{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-4"><SourceBadge type={b.sourceType} /></td>
                    <td className="px-5 py-4 text-sm font-bold text-[var(--text-primary)]">{b.poojaName}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-[var(--text-muted)]">{b.date} <br/><span className="mt-0.5 inline-block opacity-70 font-mono tracking-wide">{b.time}</span></td>
                    <td className="px-5 py-4 text-sm font-black text-[var(--text-primary)]">{b.amount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-800/50 flex items-center justify-center text-xs font-bold text-[var(--brand-primary)] shrink-0">{initials(b.devoteeName)}</div>
                        <div><div className="text-xs font-bold text-[var(--text-primary)]">{b.devoteeName}</div><div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{b.devoteePhone}</div></div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">{initials(b.priestName)}</div>
                        <div><div className="text-xs font-bold text-[var(--text-primary)]">{b.priestName}</div><div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">+94 76 249 21 18</div></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><PayBadge status={b.paymentStatus} /></td>
                    <td className="px-5 py-4"><BookingBadge status={b.bookingStatus} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 items-center">
                        <button className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100 hover:text-[var(--text-primary)] dark:hover:bg-zinc-800 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => router.push("/temple-admin/bookings/new")} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100 hover:text-[var(--text-primary)] dark:hover:bg-zinc-800 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-zinc-100 hover:text-[var(--text-primary)] dark:hover:bg-zinc-800 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Showing Results: <select className="border border-zinc-100 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]"><option>10</option><option>20</option><option>50</option></select> per page
        </div>
        <div className="flex items-center gap-1.5">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] transition-colors"><ChevronLeft className="w-3.5 h-3.5" />Previous</button>
          {[1, 2, 3].map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-[34px] h-[34px] rounded-xl border text-xs font-bold flex items-center justify-center transition-colors ${page === p ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[var(--text-muted)] hover:border-[var(--brand-primary)]"}`}>{p}</button>
          ))}
          <span className="text-zinc-400 text-xs px-2">...</span>
          {[8, 9].map(p => (
            <button key={p} className="w-[34px] h-[34px] rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-[var(--text-muted)] hover:border-[var(--brand-primary)] flex items-center justify-center transition-colors">{p}</button>
          ))}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] transition-colors">Next <ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
}
