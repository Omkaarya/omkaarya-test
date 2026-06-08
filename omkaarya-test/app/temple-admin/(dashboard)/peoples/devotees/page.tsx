"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { EntityNameCell } from "@/app/components/ds/molecules/TableCells";
import { fetchTempleAdminJson, type Devotee } from "@/lib/temple-admin-api";

export default function DevoteeManagementPage() {
  const [search, setSearch] = useState("");
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });

  const reload = async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = q?.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const data = await fetchTempleAdminJson<{ items: Devotee[] }>(`/api/temple-admin/devotees${qs}`);
      setDevotees(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load devotees.");
      setDevotees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const filtered = devotees.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.full_name.toLowerCase().includes(q) ||
      (d.phone ?? "").toLowerCase().includes(q) ||
      (d.email ?? "").toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/devotees", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
        }),
      });
      setModalOpen(false);
      setForm({ fullName: "", phone: "", email: "" });
      await reload(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create devotee.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this devotee record?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/devotees/${id}`, { method: "DELETE" });
      await reload(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete devotee.");
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-10 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-50 px-8 py-6 dark:border-zinc-800 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Devotee Management</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage devotee profiles for bookings and donations.</p>
          </div>
          <Button leadingIcon={<UserPlus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Add Devotee
          </Button>
        </div>

        <div className="px-8 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              className="h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50/50 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/10 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Search by name, phone, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading devotees…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-zinc-100 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/50">
                <tr>
                  <th className="px-8 py-3">Devotee</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-8 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-zinc-400">
                      No devotees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-8 py-4">
                        <EntityNameCell title={d.full_name} subtitle={d.gotra ?? undefined} />
                      </td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{d.phone ?? "—"}</td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-300">{d.email ?? "—"}</td>
                      <td className="px-8 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDelete(d.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Add Devotee</h2>
            <div className="mt-4 space-y-3">
              <input
                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Full name *"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
              <input
                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <input
                className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" leadingIcon={<Plus className="h-4 w-4" />} disabled={saving} onClick={() => void handleCreate()}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
