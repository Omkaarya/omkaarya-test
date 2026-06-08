"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type KioskDashboard = {
  terminals: { id: string; name: string; status: string; location: string | null }[];
  recentTransactions: { id: string; time: string; devotee: string; item: string; amount: string; status: string }[];
  stats: { terminalCount: number; onlineCount: number; todayTransactions: number };
};

export default function TempleAdminKioskDashboard() {
  const [data, setData] = useState<KioskDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchTempleAdminJson<KioskDashboard>("/api/temple-admin/kiosk/dashboard");
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load kiosk dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{error ?? "No data"}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Kiosk Center</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Terminals" value={String(data.stats.terminalCount)} chartColor="brand" showMenu={false} />
        <MetricCard title="Online" value={String(data.stats.onlineCount)} chartColor="success" showMenu={false} />
        <MetricCard title="Recent activity" value={String(data.stats.todayTransactions)} chartColor="warning" showMenu={false} />
      </div>
      <section className="rounded-2xl border p-6 dark:border-zinc-800">
        <h2 className="font-bold">Terminals</h2>
        {data.terminals.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No kiosk terminals registered yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.terminals.map((t) => (
              <li key={t.id} className="flex justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
                <span>{t.name}</span>
                <span className="font-semibold capitalize">{t.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-2xl border p-6 dark:border-zinc-800">
        <h2 className="font-bold">Recent transactions</h2>
        <ul className="mt-4 divide-y dark:divide-zinc-800">
          {data.recentTransactions.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3 text-sm">
              <span>{tx.devotee} · {tx.item}</span>
              <span className="font-medium">{tx.amount}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
