"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type Donation = {
  id: string;
  receipt_number: string;
  donor_name: string | null;
  amount: string;
  currency: string;
  occurred_at: string;
};

export default function GenerateReceiptPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchTempleAdminJson<{ items: Donation[] }>("/api/temple-admin/donations");
        setDonations(data.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load donations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Generate Receipt</h1>
          <p className="mt-1 text-sm text-zinc-500">Receipt numbers are assigned when donations are recorded.</p>
        </div>
        <Link href="/temple-admin/finance/donations">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
      </div>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
      ) : (
        <div className="overflow-hidden rounded-2xl border dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3">Receipt #</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="px-6 py-3 font-mono font-semibold text-[var(--brand-primary)]">
                    <FileText className="mr-1 inline h-4 w-4" />
                    {d.receipt_number}
                  </td>
                  <td className="px-4 py-3">{d.donor_name ?? "Anonymous"}</td>
                  <td className="px-4 py-3">{d.currency} {d.amount}</td>
                  <td className="px-4 py-3">{new Date(d.occurred_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
