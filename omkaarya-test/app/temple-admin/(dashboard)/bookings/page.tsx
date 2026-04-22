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
  { id: "BK001", poojaName: "108 Sangabhishekam", priestName: "Kamal Sharma", devoteeName: "Lakshmi Devi", devoteePhone: "+91 98765 43210", date: "2026-12-05", time: "06:00 AM", amount: "LKR 1,000", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK002", poojaName: "Sathyanarayana Pooja", priestName: "Ramesh Kumar", devoteeName: "Anjali Sharma", devoteePhone: "+91 98076 54321", date: "2026-12-06", time: "07:30 AM", amount: "LKR 1,200", paymentStatus: "Not Paid", bookingStatus: "Pending", sourceType: "Online" },
  { id: "BK003", poojaName: "Navagraha Shanti Homam", priestName: "Vijay Singh", devoteeName: "Ravi Prakash", devoteePhone: "+91 81234 55769", date: "2026-12-07", time: "09:00 AM", amount: "LKR 1,500", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK004", poojaName: "Ganapathi Homam", priestName: "Meera Joshi", devoteeName: "Vikram Singh", devoteePhone: "+91 97654 32100", date: "2026-12-08", time: "09:00 AM", amount: "LKR 800", paymentStatus: "Refunded", bookingStatus: "Cancelled", sourceType: "Online" },
  { id: "BK005", poojaName: "Annual Shraddha Tithi", priestName: "Arun Verma", devoteeName: "Sunita Iyer", devoteePhone: "+91 92345 67890", date: "2026-12-09", time: "10:30 AM", amount: "LKR 2,000", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK006", poojaName: "Navagraha Shanti Homam", priestName: "Nitin Mehta", devoteeName: "Kiran Rao", devoteePhone: "+91 93456 79901", date: "2026-12-10", time: "11:00 AM", amount: "LKR 1,100", paymentStatus: "Not Paid", bookingStatus: "Pending", sourceType: "Online" },
  { id: "BK007", poojaName: "Veetuk Krithyam", priestName: "Anil Gupta", devoteeName: "Pooja Agarwal", devoteePhone: "+91 94567 89012", date: "2026-12-11", time: "05:00 PM", amount: "LKR 1,300", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Walk-in" },
  { id: "BK008", poojaName: "Kiraga Pravesam", priestName: "Raghav Sharma", devoteeName: "Rita Joshi", devoteePhone: "+91 95678 90123", date: "2026-12-12", time: "12:00 PM", amount: "LKR 1,800", paymentStatus: "Paid", bookingStatus: "Confirmed", sourceType: "Online" },
  { id: "BK009", poojaName: "Puberty Ceremony Poojas", priestName: "Sanjay Kumar", devoteeName: "Rohan Nayak", devoteePhone: "+91 96789 01234", date: "2026-12-13", time: "01:30 PM", amount: "LKR 900", paymentStatus: "Refunded", bookingStatus: "Cancelled", sourceType: "Walk-in" },
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
  const cls = type === "Online" ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
    : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50";
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${cls}`}>{type}</span>;
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
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Bookings & Schedules</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">View and manage all pooja bookings</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] shadow-sm" : "text-zinc-400"}`}><LayoutList className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("card")} className={`p-1.5 rounded-md transition-all ${viewMode === "card" ? "bg-white dark:bg-zinc-900 text-[var(--brand-primary)] shadow-sm" : "text-zinc-400"}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button onClick={() => router.push("/temple-admin/bookings/new")} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[var(--brand-primary-hover)] transition-colors">
            <Plus className="w-3.5 h-3.5" />Add New
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2.5 flex-wrap bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5">
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-[7px] min-w-[180px]">
          <Search className="w-[13px] h-[13px] text-zinc-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search" className="border-none outline-none text-xs text-zinc-900 dark:text-zinc-100 bg-transparent w-full font-[inherit] placeholder:text-zinc-400" />
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1"><Filter className="w-3 h-3" />Filter By:</span>
        <button className="inline-flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-[6px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors" onClick={() => setSourceFilter(prev => prev ? "" : "Walk-in")}>Source Type <ChevronDown className="w-3 h-3" /></button>
        <button className="inline-flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-[6px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">Priest <ChevronDown className="w-3 h-3" /></button>
        <select value={payFilter} onChange={e => { setPayFilter(e.target.value); setPage(1); }} className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-[6px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]">
          <option value="">Payment Status</option><option>Paid</option><option>Not Paid</option><option>Refunded</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-[6px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]">
          <option value="">Booking Status</option><option>Confirmed</option><option>Pending</option><option>Cancelled</option>
        </select>
        <select className="ml-auto border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-[6px] text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]">
          <option>Sort By: Last 7 Days</option><option>Sort By: Last 30 Days</option><option>Sort By: Date Asc</option>
        </select>
      </div>

      {/* ─── CARD VIEW ─────────────────────────────────────────────── */}
      {viewMode === "card" && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-[18px] hover:border-orange-200 dark:hover:border-orange-800/50 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/temple-admin/bookings/new")}>
              {/* Top */}
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono">#{b.id}</div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{b.poojaName}</div>
                </div>
                <BookingBadge status={b.bookingStatus} />
              </div>
              {/* Priest */}
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1">
                <span className="text-orange-300">•</span> Priest: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{b.priestName}</span>
              </div>
              {/* Devotee */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center text-[10px] font-bold text-[var(--brand-primary)] shrink-0">{initials(b.devoteeName)}</div>
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{b.devoteeName}</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{b.devoteePhone}</div>
                </div>
              </div>
              {/* Date/Time */}
              <div className="grid grid-cols-2 gap-1.5 pt-2.5 mb-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"><Calendar className="w-3 h-3 text-zinc-400" />{b.date}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"><Clock className="w-3 h-3 text-zinc-400" />{b.time}</div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="text-[9px] text-zinc-400 uppercase tracking-wider">Amount</div>
                  <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">{b.amount}</div>
                </div>
                <div className="flex gap-1.5">
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
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {["", "Booking ID", "Source Type", "Services", "Date & Time", "Amount", "Devotee Info", "Priest", "Payment", "Booking Status", "Actions"].map(h => (
                  <th key={h} className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-3 py-2.5 text-left border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 cursor-pointer accent-[var(--brand-primary)]" /></td>
                  <td className="px-3 py-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">#{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-3"><SourceBadge type={b.sourceType} /></td>
                  <td className="px-3 py-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">{b.poojaName}</td>
                  <td className="px-3 py-3 text-[11px] text-zinc-500 dark:text-zinc-400">{b.date} {b.time}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100">{b.amount}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[30px] h-[30px] rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center text-[10px] font-bold text-[var(--brand-primary)] shrink-0">{initials(b.devoteeName)}</div>
                      <div><div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{b.devoteeName}</div><div className="text-[10px] text-zinc-400">{b.devoteePhone}</div></div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">{initials(b.priestName)}</div>
                      <div><div className="text-xs text-zinc-700 dark:text-zinc-300">{b.priestName}</div><div className="text-[10px] text-zinc-400">+94 76 249 21 18</div></div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><PayBadge status={b.paymentStatus} /></td>
                  <td className="px-3 py-3"><BookingBadge status={b.bookingStatus} /></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Eye className="w-3 h-3" /></button>
                      <button onClick={() => router.push("/temple-admin/bookings/new")} className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"><Pencil className="w-3 h-3" /></button>
                      <button className="w-[26px] h-[26px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:border-red-400 hover:text-red-500 transition-colors"><MoreVertical className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          Showing Results: <select className="border border-zinc-200 dark:border-zinc-700 rounded-md px-1.5 py-0.5 text-[11px] bg-white dark:bg-zinc-900 outline-none cursor-pointer font-[inherit]"><option>10</option><option>20</option><option>50</option></select> per page
        </div>
        <div className="flex items-center gap-1">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] transition-colors"><ChevronLeft className="w-3 h-3" />Previous</button>
          {[1, 2, 3].map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-[30px] h-[30px] rounded-md border text-[11px] flex items-center justify-center font-[inherit] transition-colors ${page === p ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)]"}`}>{p}</button>
          ))}
          <span className="text-zinc-400 text-xs px-1">...</span>
          {[8, 9, 10].map(p => (
            <button key={p} className="w-[30px] h-[30px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] flex items-center justify-center font-[inherit] transition-colors">{p}</button>
          ))}
          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] text-zinc-500 dark:text-zinc-400 hover:border-[var(--brand-primary)] transition-colors">Next <ChevronRight className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}
