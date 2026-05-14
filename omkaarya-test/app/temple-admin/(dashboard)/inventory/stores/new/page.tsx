"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

export default function NewStorePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError("Code and name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/inventory/stores", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/temple-admin/inventory/stores");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save store.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <Link
          href="/temple-admin/inventory/stores"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Create Store Location</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set up a new physical location or point-of-sale register for tracking inventory splits.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold">Location Details</h4>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="STR-01"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold uppercase tracking-tight outline-none focus:border-[var(--brand-primary)] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Store / Counter Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Front Desk Counter 1"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-[var(--brand-primary)] transition-colors"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="What is this associated with? (e.g. Dedicated counter for archana tickets)"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold outline-none focus:border-[var(--brand-primary)] resize-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/temple-admin/inventory/stores"
              className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Store"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold">Status</h4>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.isActive ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    form.isActive ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {form.isActive
                ? "Store is active and staff can process POS transactions through it."
                : "Store is suspended. POS endpoints associated with it will be blocked."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
