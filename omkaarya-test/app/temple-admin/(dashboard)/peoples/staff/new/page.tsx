"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UserPlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import SelectInput from "@/app/components/admin/SelectInput";
import { useValidationToast } from "@/lib/hooks/useValidationToast";
import { ValidationToast } from "@/app/components/ValidationToast";
import { fetchTempleAdminJson, type Role } from "@/lib/temple-admin-api";

export default function NewStaffPage() {
  const router = useRouter();
  const validationToast = useValidationToast();
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleSlug, setRoleSlug] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTempleAdminJson<{ items: Role[] }>("/api/temple-admin/peoples/roles");
        setRoles(data.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load roles.");
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!firstName.trim() || !email.trim()) {
      validationToast.show();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/peoples/staff", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || null,
          phoneCountryCode: phone ? "+94" : null,
          roleSlug: roleSlug || null,
          status: isActive ? "active" : "inactive",
        }),
      });
      router.push("/temple-admin/peoples/staff");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create staff member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-4xl mx-auto">
      <ValidationToast isOpen={validationToast.isOpen} onDismiss={validationToast.dismiss} />

      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800">
        <Link
          href="/temple-admin/peoples/staff"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Invite Staff Member
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
            Create an internal account for temple management, assigned to a specific role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Personal Details</h4>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">First Name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="e.g. Arun" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-[var(--brand-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="e.g. Prasad" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-[var(--brand-primary)] transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Email Address *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Required for platform login" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold outline-none focus:border-[var(--brand-primary)] transition-colors" />
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Phone Number</label>
              <div className="flex">
                <span className="flex items-center justify-center px-3 bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-xl text-sm font-bold text-zinc-500">+94</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="77 123 4567" className="w-full px-4 py-2.5 rounded-r-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold outline-none focus:border-[var(--brand-primary)] transition-colors" />
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Assign Role *</label>
              <SelectInput value={roleSlug} onChange={(e) => setRoleSlug(e.target.value)} className="!rounded-xl !py-3 !pl-4 !text-sm !font-bold">
                <option value="">Select role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.slug}>{r.name}</option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-5">
            <Link href="/temple-admin/peoples/staff" className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">Cancel</Link>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Staff
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Account Status</h4>
              <button type="button" onClick={() => setIsActive(!isActive)} className={`w-11 h-6 rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"} relative`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isActive ? "Member will be marked active immediately." : "Member will be created in inactive state."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
