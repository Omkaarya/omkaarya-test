"use client";

import { useState } from "react";
import { Trash2, Search, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

type DeleteRequest = {
  id: string;
  temple: string;
  email: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

const MOCK_REQUESTS: DeleteRequest[] = [
  {
    id: "req-001",
    temple: "Sri Murugan Temple",
    email: "admin@srimurugan.org",
    requestedAt: "2026-04-20T10:00:00Z",
    status: "Pending",
    reason: "Temple closing down due to relocation",
  },
  {
    id: "req-002",
    temple: "Shiva Mandir London",
    email: "trustee@shivamandir.co.uk",
    requestedAt: "2026-04-18T08:30:00Z",
    status: "Approved",
    reason: "Migrating to a different platform",
  },
  {
    id: "req-003",
    temple: "Venkateswara Temple",
    email: "info@vtuk.org",
    requestedAt: "2026-04-15T14:20:00Z",
    status: "Rejected",
    reason: "Requested in error",
  },
];

const STATUS_STYLES: Record<DeleteRequest["status"], string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
  Rejected: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
};

const STATUS_ICONS = {
  Pending: <Clock className="w-3 h-3" />,
  Approved: <CheckCircle2 className="w-3 h-3" />,
  Rejected: <XCircle className="w-3 h-3" />,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function DeleteAccountRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DeleteRequest["status"]>("All");

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch =
      search === "" ||
      r.temple.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = MOCK_REQUESTS.filter((r) => r.status === "Pending").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Delete Account Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review and process account deletion requests from temples
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting review
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: "Total Requests", value: MOCK_REQUESTS.length },
          { label: "Pending", value: MOCK_REQUESTS.filter((r) => r.status === "Pending").length },
          { label: "Processed", value: MOCK_REQUESTS.filter((r) => r.status !== "Pending").length },
        ] as const).map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
            <div className="text-xs font-medium text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="Search temple or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)] dark:text-zinc-100"
          />
        </div>
        <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
            <Trash2 className="w-8 h-8" />
            <span className="text-sm">No requests matching your filters</span>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {["Temple", "Contact Email", "Requested", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{req.temple}</div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{req.id}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400">{req.email}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                    {formatDate(req.requestedAt)}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${STATUS_STYLES[req.status]}`}>
                      {STATUS_ICONS[req.status]} {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50">
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
