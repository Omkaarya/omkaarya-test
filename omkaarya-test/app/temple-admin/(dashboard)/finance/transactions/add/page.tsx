"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Wallet, CreditCard, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/app/components/ds/atoms/Button";
import SelectInput from "@/app/components/admin/SelectInput";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

const templeFormSelect =
  "!h-11 !min-h-0 !rounded-xl !py-0 !pl-4 !text-sm !text-[var(--text-primary)] !border-zinc-100 !bg-white focus:!ring-2 focus:!ring-[var(--brand-primary)] dark:!border-zinc-800 dark:!bg-zinc-950";

type EntryKind = "income" | "expense" | "adjustment";

const TYPE_CARDS: { id: EntryKind; icon: LucideIcon; name: string; desc: string; selClass: string }[] = [
  {
    id: "income",
    icon: Wallet,
    name: "Income",
    desc: "Manual income (rent, hall hire, etc.)",
    selClass: "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20",
  },
  {
    id: "expense",
    icon: CreditCard,
    name: "Expense",
    desc: "Purchases, maintenance, staff",
    selClass: "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20",
  },
  {
    id: "adjustment",
    icon: Sparkles,
    name: "Adjustment",
    desc: "Reconciliations and corrections",
    selClass: "border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-900/20",
  },
];

export default function AddTransactionPage() {
  const router = useRouter();
  const [entryKind, setEntryKind] = useState<EntryKind>("income");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [createdBy, setCreatedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (!occurredAt) {
      setError("Date is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/finance/entries", {
        method: "POST",
        body: JSON.stringify({
          entryKind,
          amount: Number(amount),
          currency: currency || "INR",
          category: category.trim() || null,
          description: description.trim() || null,
          reference: reference.trim() || null,
          occurredAt: new Date(occurredAt).toISOString(),
          createdBy: createdBy.trim() || null,
        }),
      });
      router.push("/temple-admin/finance/transactions");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link href="/temple-admin/finance/transactions" className="text-brand hover:text-brand-600 font-medium transition-colors">
          Transactions
        </Link>
        <span className="text-text-quaternary">›</span>
        <span>Add transaction</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Add transaction</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Record a manual financial entry. POS sales, donations and bookings are captured automatically by their own
            modules.
          </p>
        </div>
        <Link href="/temple-admin/finance/transactions">
          <Button variant="outline" size="sm" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Transaction type</h3>
        <div className="grid grid-cols-3 gap-4">
          {TYPE_CARDS.map((tc) => (
            <button
              key={tc.id}
              onClick={() => setEntryKind(tc.id)}
              className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                entryKind === tc.id
                  ? tc.selClass
                  : "border-zinc-100 bg-white text-[var(--text-primary)] hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              }`}
            >
              <tc.icon className="h-6 w-6 mb-1" />
              <div className="text-sm font-bold">{tc.name}</div>
              <div className="text-[10px] opacity-80 leading-snug">{tc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-4 pb-3 border-b border-border-secondary">Transaction details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Amount *</label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Currency</label>
            <input
              type="text"
              maxLength={8}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date &amp; time *</label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <SelectInput value={category} onChange={(e) => setCategory(e.target.value)} className={templeFormSelect}>
              <option value="">Select category</option>
              <optgroup label="Income">
                <option value="hall_rental">Hall rental</option>
                <option value="other_income">Other income</option>
                <option value="grant">Grant</option>
              </optgroup>
              <optgroup label="Expense">
                <option value="inventory_purchase">Inventory purchase</option>
                <option value="staff_salary">Staff / priest salary</option>
                <option value="maintenance">Maintenance &amp; repair</option>
                <option value="utilities">Utilities</option>
                <option value="events">Events &amp; festivals</option>
              </optgroup>
              <optgroup label="Adjustment">
                <option value="reconciliation">Reconciliation</option>
                <option value="correction">Correction</option>
              </optgroup>
            </SelectInput>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt number, invoice number, etc."
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recorded by</label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Your name"
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description / notes</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this transaction for?"
              className="h-11 border border-zinc-100 rounded-xl px-4 text-sm text-[var(--text-primary)] bg-white outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-6 border-t border-border-secondary">
          <Link href="/temple-admin/finance/transactions">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save transaction"}
          </Button>
        </div>
      </div>
    </div>
  );
}
