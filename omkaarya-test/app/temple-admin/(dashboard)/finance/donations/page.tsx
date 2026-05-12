"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, CircleUser, Gift, Loader2, AlertCircle, X } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import SelectInput from "@/app/components/admin/SelectInput";
import { fetchTempleAdminJson, type Devotee, type Donation } from "@/lib/temple-admin-api";

const templeToolbarSelect =
  "!h-10 !min-h-0 !rounded-xl !py-0 !pl-3 !text-sm !border-zinc-100 !bg-white focus:!ring-2 focus:!ring-[var(--brand-primary)] dark:!border-zinc-800 dark:!bg-zinc-950";

function fmtCurrency(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return `${currency} 0`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

export default function TempleDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, dev] = await Promise.all([
        fetchTempleAdminJson<{ items: Donation[] }>("/api/temple-admin/donations?limit=200"),
        fetchTempleAdminJson<{ items: Devotee[] }>("/api/temple-admin/devotees"),
      ]);
      setDonations(d.items ?? []);
      setDevotees(dev.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load donations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = useMemo(() => {
    let list = donations;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        (d.donor_name ?? d.devotee_name ?? "").toLowerCase().includes(q) ||
        d.receipt_number.toLowerCase().includes(q)
      );
    }
    if (methodFilter) list = list.filter((d) => (d.payment_method ?? "") === methodFilter);
    return list;
  }, [donations, search, methodFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthDonations = donations.filter((d) => new Date(d.occurred_at) >= monthStart);
    const total = monthDonations.reduce((s, d) => s + Number(d.amount), 0);
    const cash = monthDonations
      .filter((d) => (d.payment_method ?? "cash").toLowerCase() === "cash")
      .reduce((s, d) => s + Number(d.amount), 0);
    const inKind = monthDonations.filter((d) => (d.payment_method ?? "").toLowerCase() === "in_kind");
    return {
      total,
      donorCount: monthDonations.length,
      cash,
      inKindCount: inKind.length,
      anonymousCount: monthDonations.filter((d) => d.is_anonymous).length,
    };
  }, [donations]);

  const methods = useMemo(() => {
    const s = new Set<string>();
    for (const d of donations) if (d.payment_method) s.add(d.payment_method);
    return Array.from(s);
  }, [donations]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">Donations</h1>
          <p className="mt-1 text-sm text-text-tertiary">Cash and in-kind donations from devotees · Live records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" className="gap-2" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" /> Record donation
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total this month</p>
          <p className="text-2xl font-bold text-blue-600">{fmtCurrency(stats.total)}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">{stats.donorCount} entries</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Cash</p>
          <p className="text-2xl font-bold text-green-600">{fmtCurrency(stats.cash)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">In-kind entries</p>
          <p className="text-2xl font-bold text-[var(--brand-primary)]">{stats.inKindCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Anonymous</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.anonymousCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor name or receipt…"
            className="h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <SelectInput
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className={templeToolbarSelect}
          wrapperClassName="w-auto min-w-[8rem]"
        >
          <option value="">All methods</option>
          {methods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                {["When", "Donor", "Method", "Receipt", "Notes", "Amount"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-zinc-400 uppercase tracking-wider px-6 py-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                    {donations.length === 0 ? "No donations recorded yet." : "No donations match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {new Date(d.occurred_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                          <CircleUser className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">
                            {d.is_anonymous ? "Anonymous" : d.donor_name ?? d.devotee_name ?? "—"}
                          </div>
                          {(d.donor_phone || d.donor_email) && !d.is_anonymous && (
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">
                              {d.donor_phone ?? d.donor_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {d.payment_method === "in_kind" && <Gift className="h-3 w-3" />}
                        {d.payment_method ?? "Cash"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-mono uppercase">{d.receipt_number}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{d.notes ?? d.category ?? "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">{fmtCurrency(d.amount, d.currency)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <NewDonationDrawer
          devotees={devotees}
          onClose={() => setDrawerOpen(false)}
          onSaved={async () => {
            setDrawerOpen(false);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function NewDonationDrawer({
  devotees,
  onClose,
  onSaved,
}: {
  devotees: Devotee[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [devoteeId, setDevoteeId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [category, setCategory] = useState("");
  const [reference, setReference] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notes, setNotes] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const receiptNumber = `DON-${Date.now().toString(36).toUpperCase()}`;
      await fetchTempleAdminJson("/api/temple-admin/donations", {
        method: "POST",
        body: JSON.stringify({
          receiptNumber,
          devoteeId: devoteeId || null,
          donorName: isAnonymous ? null : donorName.trim() || null,
          donorPhone: isAnonymous ? null : donorPhone.trim() || null,
          donorEmail: isAnonymous ? null : donorEmail.trim() || null,
          amount: Number(amount),
          currency: currency || "INR",
          category: category.trim() || null,
          paymentMethod,
          reference: reference.trim() || null,
          isAnonymous,
          notes: notes.trim() || null,
          occurredAt: new Date(occurredAt).toISOString(),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save donation.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-11 px-4 rounded-xl border border-zinc-100 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Record donation</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Linked devotee</label>
            <SelectInput
              value={devoteeId}
              onChange={(e) => setDevoteeId(e.target.value)}
              className="!h-11 !rounded-xl !text-sm !border-zinc-100 !bg-white dark:!border-zinc-800 dark:!bg-zinc-950 mt-1.5"
            >
              <option value="">No linked devotee</option>
              {devotees.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="flex items-center gap-2">
            <input id="anon" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            <label htmlFor="anon" className="text-xs text-[var(--text-secondary)]">Anonymous donor</label>
          </div>
          {!isAnonymous && (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Donor name</label>
                <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className={inputCls + " mt-1.5"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Phone</label>
                  <input value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className={inputCls + " mt-1.5"} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</label>
                  <input value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} type="email" className={inputCls + " mt-1.5"} />
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Amount *</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputCls + " mt-1.5"}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Currency</label>
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={8} className={inputCls + " mt-1.5"} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Method</label>
            <SelectInput
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="!h-11 !rounded-xl !text-sm !border-zinc-100 !bg-white dark:!border-zinc-800 dark:!bg-zinc-950 mt-1.5"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
              <option value="upi">UPI</option>
              <option value="in_kind">In-kind</option>
            </SelectInput>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Hundi, Pooja fund, Annadhanam"
              className={inputCls + " mt-1.5"}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Cheque no, transaction id"
              className={inputCls + " mt-1.5"}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Date &amp; time</label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className={inputCls + " mt-1.5"}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-100 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-950 mt-1.5 resize-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-[var(--text-primary)] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Record donation"}
          </button>
        </div>
      </div>
    </>
  );
}
