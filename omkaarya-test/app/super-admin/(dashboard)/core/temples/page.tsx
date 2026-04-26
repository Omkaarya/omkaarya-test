"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  Eye, 
  MoreVertical, 
  Pencil, 
  Plus, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Users2, 
  MapPin, 
  CreditCard, 
  Building2,
  AlertTriangle,
  Search,
  ArrowRight,
  History
} from "lucide-react";
import type { MockTemple, TemplePlan } from "@/lib/mock-temples";
import type { TemplesSortBy } from "@/lib/temples-query";

// ─── Omkaarya Design System ───────────────────────────────────────
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Breadcrumb } from "@/app/components/ds/molecules/Breadcrumb";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { AvatarCell, TextCell, ActionGroupCell } from "@/app/components/ds/molecules/TableCells";
import StatusBadge from "@/app/components/admin/StatusBadge";
import ComplianceBadge from "@/app/components/admin/ComplianceBadge";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function TemplesAdminPage() {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState<MockTemple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/temples`);
        if (!response.ok) throw new Error("Failed to load temples");
        const j = await response.json();
        const payload = j.success ? j.data : j;
        setRows(payload.data || []);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumb 
            items={[{ label: "Core", href: "#" }, { label: "Temples" }]} 
            className="mb-2"
          />
          <h1 className="text-display-xs font-bold text-text-primary tracking-tight">Temples</h1>
        </div>
        <Link href="/super-admin/create-temple">
          <Button leadingIcon={<Plus className="w-4 h-4" />}>Create Temple</Button>
        </Link>
      </div>

      {/* ─── Table Card ─────────────────────────────────────────────── */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex-1 max-w-md">
              <SearchInput 
                placeholder="Search temples..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">Filters</Button>
              <Button variant="outline" size="sm">Export</Button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-20 text-center text-text-tertiary font-bold animate-pulse">Loading temples...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-subtle border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-text-tertiary uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[11px] font-black text-text-tertiary uppercase tracking-widest">Temple Name</th>
                  <th className="px-6 py-4 text-[11px] font-black text-text-tertiary uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[11px] font-black text-text-tertiary uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-[11px] font-black text-text-tertiary uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.tenantId} className="hover:bg-subtle/50 transition-colors group">
                    <td className="px-6 py-5">
                       <span className="text-xs font-bold text-text-tertiary font-mono">{row.tenantId}</span>
                    </td>
                    <td className="px-6 py-5">
                       <AvatarCell title={row.name} subtitle={row.slug} initials={initials(row.name)} />
                    </td>
                    <td className="px-6 py-5">
                       <TextCell text="Chennai, India" subtext="Tamil Nadu" />
                    </td>
                    <td className="px-6 py-5">
                       <Badge variant="outline">{row.plan}</Badge>
                    </td>
                    <td className="px-6 py-5">
                       <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-5">
                       <ActionGroupCell>
                          <Button variant="ghost" size="sm" iconOnly><Eye className="w-4 h-4" /></Button>
                          <Link href={`/super-admin/edit-temple/${row.tenantId}`}>
                            <Button variant="ghost" size="sm" iconOnly><Pencil className="w-4 h-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" iconOnly><MoreVertical className="w-4 h-4" /></Button>
                       </ActionGroupCell>
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
