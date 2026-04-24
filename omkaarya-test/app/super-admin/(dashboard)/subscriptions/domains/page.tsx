"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MoreVertical, 
  Globe,
  Info,
  Calendar,
  Shield,
  X
} from "lucide-react";
import StatusBadge from "@/app/components/admin/StatusBadge";
import AdminDataTable from "@/app/components/admin/AdminDataTable";

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_DOMAINS = [
  { id: "Temp-001", org: "Shiva Mandir London", subdomain: "shiva-mandir-london.omkaarya.com", plan: "Aaradhana", created: "10 Apr 2024", status: "Approved" },
  { id: "Temp-002", org: "Iskcon Temple New Jersey", subdomain: "iskcon-new-jersey.omkaarya.com", plan: "Sankalpa", created: "10 Apr 2024", status: "Pending" },
  { id: "Temp-003", org: "Hindu Mandir Chicago", subdomain: "hindu-mandir-chicago.omkaarya.com", plan: "Aaradhana", created: "11 Apr 2024", status: "Pending" },
  { id: "Temp-004", org: "Ganesha Temple Houston", subdomain: "ganesha-temple-houston.omkaarya.com", plan: "Sankalpa", created: "12 Apr 2024", status: "Suspended" },
  { id: "Temp-005", org: "Durga Mandir Toronto", subdomain: "durga-mandir-toronto.omkaarya.com", plan: "Aaradhana", created: "12 Apr 2024", status: "Rejected" },
  { id: "Temp-006", org: "BAPS Shri Swaminarayan Atlanta", subdomain: "baps-atlanta.omkaarya.com", plan: "Sankalpa", created: "13 Apr 2024", status: "Approved" },
  { id: "Temp-007", org: "Krishna Mandir San Francisco", subdomain: "krishna-mandir-sf.omkaarya.com", plan: "Aaradhana", created: "14 Apr 2024", status: "Approved" },
];

// ── Page Component ──────────────────────────────────────────────────

export default function SubDomainsPage() {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<typeof MOCK_DOMAINS[0] | null>(null);

  const filtered = useMemo(() => {
    return MOCK_DOMAINS.filter(d => 
      d.org.toLowerCase().includes(search.toLowerCase()) || 
      d.subdomain.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Subdomains</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-medium italic">
          Manage your customer-facing root domains and account URLs here.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by name, slug, or admin email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium outline-none focus:border-[var(--brand-primary)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
           <button className="px-4 py-2 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm uppercase tracking-wider">All</button>
           <button className="px-4 py-2 text-[10px] font-bold rounded-lg text-zinc-500 uppercase tracking-wider hover:text-zinc-900 transition-colors">Approved</button>
           <button className="px-4 py-2 text-[10px] font-bold rounded-lg text-zinc-500 uppercase tracking-wider hover:text-zinc-900 transition-colors">Pending</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <AdminDataTable headers={["Temple ID", "Account URL", "Plan", "Created On", "Status", "Actions"]}>
           {filtered.map((d) => (
             <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => setSelectedDomain(d)}>
                <td className="px-6 py-4 text-xs font-bold text-zinc-400">#{d.id}</td>
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{d.org}</span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        {d.subdomain} <ExternalLink className="w-3 h-3" />
                      </span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                     d.plan === 'Aaradhana' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-pink-50 text-pink-700 border border-pink-100'
                   }`}>
                      {d.plan}
                   </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-zinc-500">{d.created}</td>
                <td className="px-6 py-4">
                   <StatusBadge status={d.status as any} />
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900"><MoreVertical className="w-4 h-4" /></button>
                </td>
             </tr>
           ))}
        </AdminDataTable>
      </div>

      {/* Domain Details Modal */}
      {selectedDomain && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-300">
           <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setSelectedDomain(null)} />
           <div className="relative z-10 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                 <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                       <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{selectedDomain.org}</h2>
                       <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={selectedDomain.status as any} />
                          <span className="text-xs text-zinc-400 font-medium">Domain Settings</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedDomain(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl">
                    <X className="w-5 h-5 text-zinc-400" />
                 </button>
              </div>

              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Plan Name</p>
                       <p className="text-sm font-bold text-zinc-900 dark:text-white">{selectedDomain.plan}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Billing Frequency</p>
                       <p className="text-sm font-bold text-zinc-900 dark:text-white">Monthly</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price</p>
                       <p className="text-sm font-bold text-zinc-900 dark:text-white">₹2,999.00</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Created On</p>
                       <p className="text-sm font-bold text-zinc-900 dark:text-white">{selectedDomain.created}</p>
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Active Account URL</h3>
                       <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Edit URL</button>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                       <span className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate pr-4">{selectedDomain.subdomain}</span>
                       <ExternalLink className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div className="flex items-start gap-2 pt-2">
                       <Info className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
                       <p className="text-[10px] text-zinc-400 leading-relaxed">This URL is auto-generated based on the organization's legal name. Any changes will require a DNS propagation period of up to 24 hours.</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                 <button onClick={() => setSelectedDomain(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all">Close Details</button>
                 <button className="px-8 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">Update Domain</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
