"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Mail, Shield, MoreHorizontal, UserPlus, Trash2,
  CheckCircle2, XCircle, X, Loader2, RefreshCw, AlertCircle,
  UserCheck, UserX,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

// ── Types ──────────────────────────────────────────────────────────

type SaUser = {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  roleName: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
};

type SaRole = {
  id: number;
  name: string;
};

type FormState = {
  name: string;
  email: string;
  roleId: string;
};

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function avatarColor(name: string): string {
  const colors = [
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

// ── Modal Component ────────────────────────────────────────────────

function AddUserModal({
  roles,
  onClose,
  onSaved,
}: {
  roles: SaRole[];
  onClose: () => void;
  onSaved: (user: SaUser) => void;
}) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", roleId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          roleId: form.roleId ? parseInt(form.roleId, 10) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to create user");
        return;
      }
      onSaved(json.data);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Add Platform User</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Create a new Super Admin portal user</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Anand Kumar"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="user@pepulux.com"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Role</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] font-[inherit]"
            >
              <option value="">No Role Assigned</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} className="flex-1">
              {saving ? "Creating…" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SaUser[]>([]);
  const [roles, setRoles] = useState<SaRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin-users"),
        fetch("/api/admin-roles"),
      ]);
      const usersJson = await usersRes.json();
      const rolesJson = await rolesRes.json();

      if (usersJson.success) setUsers(usersJson.data);
      if (rolesJson.success) setRoles(rolesJson.data);
    } catch {
      setError("Failed to load data. Please check your database connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    setActionMenu(null);
    try {
      const res = await fetch(`/api/admin-users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleActive: true }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? json.data : u)));
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    setActionMenu(null);
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || String(u.roleId) === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage platform-level users and their access roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => setShowModal(true)}>
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length },
          { label: "Active", value: activeCount },
          { label: "Inactive", value: users.length - activeCount },
          { label: "Roles", value: roles.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
            <div className="text-xs font-medium text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)] dark:text-zinc-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm outline-none focus:ring-2 ring-[var(--brand-primary)] dark:text-zinc-100 font-[inherit]"
        >
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={String(r.id)}>{r.name}</option>
          ))}
        </select>
        <div className="text-xs text-zinc-400 sm:ml-auto">
          {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <span className="text-sm text-amber-600 dark:text-amber-400">{error}</span>
            <Button variant="outline" size="sm" onClick={load}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
            <UserX className="w-8 h-8" />
            <span className="text-sm">No users found</span>
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              Add your first user
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                {["User", "Role", "Status", "Last Login", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group relative"
                  onClick={() => setActionMenu(null)}
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(user.name)}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    {user.roleName ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        {user.roleName}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No role</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wide bg-zinc-50 dark:bg-zinc-800/30 px-2 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {timeAgo(user.lastLogin)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="relative flex items-center justify-end gap-1">
                      {(togglingId === user.id || deletingId === user.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenu(actionMenu === user.id ? null : user.id);
                            }}
                            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {actionMenu === user.id && (
                            <div
                              className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleToggle(user.id)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                              >
                                {user.isActive ? (
                                  <><UserX className="w-3.5 h-3.5 text-amber-500" /> Deactivate</>
                                ) : (
                                  <><UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Activate</>
                                )}
                              </button>
                              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete User
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <AddUserModal
          roles={roles}
          onClose={() => setShowModal(false)}
          onSaved={(user) => {
            setUsers((prev) => [user, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
