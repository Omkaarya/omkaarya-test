"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "@/app/components/ds/molecules/Breadcrumb";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { Button } from "@/app/components/ds/atoms/Button";
import { Select } from "@/app/components/ds/atoms/Select";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { 
  Monitor, 
  Banknote, 
  Clock, 
  ShoppingCart, 
  Settings,
  ArrowRight,
  MonitorCheck
} from "lucide-react";

export default function PosDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* ─── Header Section ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <Breadcrumb 
            items={[
              { label: "Sales", href: "/temple-admin/finance" },
              { label: "POS" }
            ]} 
            className="mb-2"
          />
          <h1 className="text-display-xs font-bold text-text-primary tracking-tight">
            Point of Sale
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-[180px]">
            <Select 
              options={[
                { value: "1", label: "Vertical Layout" },
                { value: "2", label: "Horizontal Layout" }
              ]} 
              defaultValue="1" 
              onChange={(e) => {
                const val = e.target.value;
                const url = new URL(window.location.href);
                url.searchParams.set("layout", val);
                window.history.pushState({}, "", url);
              }}
            />
          </div>

          <Link href={`/temple-admin/pos/open-session?layout=${typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('layout') || '1' : '1'}`}>
            <Button size="md" leadingIcon={<Monitor className="w-4 h-4" />}>
              Open POS Terminal
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Registers" 
          value="1 / 1" 
          chartColor="gray"
        />
        <MetricCard 
          title="Today's Revenue" 
          value="LKR 0.00" 
          chartColor="success"
        />
        <MetricCard 
          title="Open Sessions" 
          value="0" 
          chartColor="warning"
        />
        <MetricCard 
          title="Avg Transaction" 
          value="LKR 0.00" 
          chartColor="brand"
        />
      </div>

      {/* ─── Primary Actions ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <ActionCard 
          icon={Monitor} 
          title="Terminal" 
          description="Access the checkout interface."
          href="/temple-admin/pos/open-session"
        />
        <ActionCard 
          icon={Clock} 
          title="Sessions" 
          description="Manage active shifts."
          href="/temple-admin/pos/sessions"
        />
        <ActionCard 
          icon={Settings} 
          title="Registers" 
          description="Configure hardware settings."
          href="/temple-admin/pos/registers"
        />
      </div>

      {/* ─── Terminal Sessions Table ─────────────────────────────────── */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
           <h3 className="text-md font-bold text-text-primary">Active Sessions</h3>
           <Button variant="outline" size="sm" trailingIcon={<ArrowRight className="w-4 h-4" />}>
             View All
           </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-subtle">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Register</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-xs font-semibold text-text-tertiary"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <MonitorCheck className="w-10 h-10 text-text-disabled" />
                    <p className="text-sm font-medium text-text-tertiary">No sessions are currently active.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, href }: any) {
  return (
    <Link href={href}>
      <div className="bg-surface p-8 rounded-2xl border border-border shadow-xs hover:border-brand transition-all group flex items-start gap-5">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand flex items-center justify-center shrink-0">
           <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-md font-bold text-text-primary mb-1">{title}</h3>
          <p className="text-sm font-medium text-text-tertiary leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
