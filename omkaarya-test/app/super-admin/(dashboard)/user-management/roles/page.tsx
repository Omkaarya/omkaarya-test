"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { formSnapshot } from "@/lib/form-snapshot";
import { useModalFormSession } from "@/lib/use-modal-form-session";
import {
  Plus,
  Shield,
  Lock,
  Settings2,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import FormField from "@/app/components/admin/FormField";
import { DashboardPageHeader } from "@/app/components/admin/DashboardPageHeader";
import TextareaInput from "@/app/components/admin/TextareaInput";
import TextInput from "@/app/components/admin/TextInput";
import Link from "next/link";
import type { TempleDefaultRole } from "@/lib/temple-default-roles";

// ── Types ──────────────────────────────────────────────────────────

type SaRole = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
};

type TempleRoleDefinition = TempleDefaultRole;

// ── Colour helpers ─────────────────────────────────────────────────

const ACCENT: Record<string, { badge: string; icon: string; tag: string }> = {
  orange: {
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    icon: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-100 dark:border-orange-900",
    tag: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  },
  yellow: {
    badge:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
    icon: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 border-yellow-100 dark:border-yellow-900",
    tag: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  emerald: {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900",
    tag: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  blue: {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    icon: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100 dark:border-blue-900",
    tag: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  purple: {
    badge:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
    icon: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-100 dark:border-purple-900",
    tag: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  },
  rose: {
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    icon: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100 dark:border-rose-900",
    tag: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
  },
};

const MAX_VISIBLE_TAGS = 8;

// ── Role Definition Card ───────────────────────────────────────────

function RoleDefinitionCard({ role }: { role: TempleDefaultRole }) {
  const accent = ACCENT[role.color] ?? ACCENT.blue;
  const visible = role.permissions.slice(0, MAX_VISIBLE_TAGS);
  const overflow = role.permissions.length - MAX_VISIBLE_TAGS;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${accent.icon}`}
          >
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {role.name}
              </span>
              {role.isSystem && (
                <span title="System role — cannot be deleted">
                  <Lock className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              {role.description}
            </p>
          </div>
        </div>

        {/* Configure button */}
        <Link
          href={`/super-admin/user-management/roles/configure?role=${role.id}&name=${encodeURIComponent(role.name)}&type=temple`}
        >
          <span className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors whitespace-nowrap">
            <Settings2 className="w-3 h-3" />
            Configure
          </span>
        </Link>
      </div>

      {/* Permission Tags */}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((perm) => (
          <span
            key={perm}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${accent.tag}`}
          >
            {perm}
          </span>
        ))}
        {overflow > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            + {overflow} More
          </span>
        )}
      </div>
    </div>
  );
}

// ── User Allocations Tab (existing accordion-style) ────────────────

function RoleAccordionCard({ role }: { role: SaRole }) {
  const badgeColor =
    {
      "Super Admin":
        "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
      "Support Agent":
        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
      "Finance Reviewer":
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
    }[role.name] ??
    "bg-zinc-50 text-zinc-700 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="flex items-center px-6 py-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 dark:border-blue-900">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1 mx-4 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <TruncateText className="text-sm font-bold text-zinc-900 dark:text-zinc-50" title={role.name}>
              {role.name}
            </TruncateText>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}
            >
              {role.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {role.description}
          </p>
        </div>
        <div className="flex items-center gap-6 mr-4">
          <div className="text-center hidden sm:block">
            <div className="flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              {role.userCount}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
              Users
            </div>
          </div>
        </div>
        <Link
          href={`/super-admin/user-management/roles/configure?role=${role.id}&name=${encodeURIComponent(role.name)}`}
        >
          <span className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Configure
          </span>
        </Link>
      </div>
    </div>
  );
}

// ── Create Role Modal ──────────────────────────────────────────────

const EMPTY_ROLE_FORM = { name: "", description: "" };

function CreateRoleModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (r: SaRole) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baselineRef = useRef(formSnapshot(EMPTY_ROLE_FORM));
  const isDirty = useMemo(
    () => formSnapshot({ name, description }) !== baselineRef.current,
    [name, description],
  );
  const session = useModalFormSession({ isDirty, onClose });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to create role");
        return;
      }
      session.completeSuccess("Role created successfully.", () => {
        onSaved(json.data);
        onClose();
      });
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={session.requestClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Create Role
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Define a new Super Admin portal role
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <PostSaveSuccessBanner text={session.postSave.bannerText} />
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <fieldset
            disabled={session.postSave.isLocked}
            className="space-y-5 border-0 p-0 m-0 min-w-0"
          >
            <FormField id="sa-role-name" label="Role Name" required>
              <TextInput
                id="sa-role-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Finance Reviewer"
              />
            </FormField>
            <FormField id="sa-role-description" label="Description">
              <TextareaInput
                id="sa-role-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role can do…"
                className="resize-none"
              />
            </FormField>
          </fieldset>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={session.requestClose}
              className="flex-1"
              disabled={session.postSave.isLocked}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
              className="flex-1"
              disabled={session.postSave.isLocked}
            >
              {saving ? "Creating…" : "Create Role"}
            </Button>
          </div>
        </form>
      </div>

      <UnsavedChangesDialog
        dialogRef={session.modalGuard.dialogRef}
        onStay={session.modalGuard.closeDialog}
        onLeave={session.modalGuard.confirmLeave}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

type Tab = "definitions" | "allocations";

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("definitions");
  const [roles, setRoles] = useState<SaRole[]>([]);
  const [templeRoles, setTempleRoles] = useState<TempleRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [templeRolesLoading, setTempleRolesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templeRolesError, setTempleRolesError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-roles");
      const json = await res.json();
      if (json.success) setRoles(json.data);
      else setError("Failed to load roles.");
    } catch {
      setError("Network error — please check your database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTempleRoles = useCallback(async () => {
    setTempleRolesLoading(true);
    setTempleRolesError(null);
    try {
      const res = await fetch("/api/temple-default-roles", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTempleRoles(json.data as TempleRoleDefinition[]);
      } else {
        setTempleRolesError(json.error?.message ?? "Failed to load temple role definitions.");
      }
    } catch {
      setTempleRolesError("Network error — could not load temple roles.");
    } finally {
      setTempleRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadTempleRoles();
  }, [load, loadTempleRoles]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "definitions", label: "Role Definitions" },
    { id: "allocations", label: "User Allocations" },
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Roles & Permissions"
        description="Manage organization roles and user assignments."
        actions={
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" /> Create Role
          </Button>
        }
      />

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Role Definitions ── */}
      {activeTab === "definitions" && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl px-4 py-3">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              These are the <strong>default temple roles</strong> seeded for
              every new temple tenant. Roles marked with{" "}
              <Lock className="w-3 h-3 inline-block mx-0.5 text-blue-400" /> are
              system-locked and cannot be deleted. Use{" "}
              <strong>Configure</strong> to adjust permissions per role.
            </p>
          </div>

          {templeRolesLoading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
              <span className="text-sm">Loading temple role definitions…</span>
            </div>
          ) : templeRolesError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
              <AlertCircle className="h-8 w-8 text-amber-400" />
              <span className="text-sm text-amber-600 dark:text-amber-400">{templeRolesError}</span>
              <Button variant="outline" size="sm" onClick={loadTempleRoles}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templeRoles.map((role) => (
                <RoleDefinitionCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: User Allocations ── */}
      {activeTab === "allocations" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Roles", value: roles.length },
              {
                label: "Active Roles",
                value: roles.filter((r) => r.isActive).length,
              },
              {
                label: "Total Assigned Users",
                value: roles.reduce((s, r) => s + r.userCount, 0),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm"
              >
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {value}
                </div>
                <div className="text-xs font-medium text-zinc-500 mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Roles list */}
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
              <span className="text-sm">Loading roles…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {error}
              </span>
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-zinc-400">
              <Shield className="w-8 h-8" />
              <span className="text-sm">No roles defined yet</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                Create your first role
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <RoleAccordionCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Role Modal */}
      {showModal && (
        <CreateRoleModal
          onClose={() => setShowModal(false)}
          onSaved={(role) => {
            setRoles((prev) => [...prev, role]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
