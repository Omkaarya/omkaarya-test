"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Mail, Shield, MoreHorizontal, UserPlus, Trash2,
  CheckCircle2, XCircle, X, Loader2, RefreshCw, AlertCircle,
  UserCheck, UserX,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import AdminListCard from "@/app/components/admin/AdminListCard";
import AdminPagination from "@/app/components/admin/AdminPagination";
import SelectInput from "@/app/components/admin/SelectInput";
import { AdminTableToolbar, AdminTableToolbarEnd, AdminTableToolbarStart } from "@/app/components/admin/AdminTableToolbar";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type SaUser = {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
};

type SaRole = {
  id: string;
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
          roleId: form.roleId.trim() || null,
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
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = useCallback(async (id: string) => {
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
  }, []);

  const handleDelete = useCallback(async (id: string) => {
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
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          search === "" ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || String(u.roleId) === roleFilter;
        return matchSearch && matchRole;
      }),
    [users, search, roleFilter],
  );

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageRows = useMemo(() => {
    const safe = Math.min(page, totalPages);
    const start = (safe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, totalPages]);

  const columns = useMemo<ColumnDef<SaUser>[]>(
    () => [
      {
        key: "user",
        header: "User",
        cell: (user) => (
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.name)}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{user.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-text-tertiary">
                <Mail className="h-3 w-3" /> {user.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        cell: (user) =>
          user.roleName ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              {user.roleName}
            </div>
          ) : (
            <span className="text-xs italic text-text-tertiary">No role</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        cell: (user) =>
          user.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-subtle px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">
              <XCircle className="h-3 w-3" /> Inactive
            </span>
          ),
      },
      {
        key: "lastLogin",
        header: "Last login",
        cell: (user) => <span className="text-xs font-medium text-text-tertiary">{timeAgo(user.lastLogin)}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (user) => (
          <div className="relative flex items-center justify-end gap-1">
            {togglingId === user.id || deletingId === user.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-quaternary" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenu(actionMenu === user.id ? null : user.id);
                  }}
                  className="rounded-lg p-2 text-text-quaternary opacity-0 transition-all hover:bg-subtle hover:text-text-primary group-hover:opacity-100"
                  aria-label="Open actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {actionMenu === user.id && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-surface py-1 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(user.id)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-subtle hover:text-text-primary"
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-3.5 w-3.5 text-amber-500" /> Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Activate
                        </>
                      )}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete user
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ),
      },
    ],
    [actionMenu, togglingId, deletingId, handleToggle, handleDelete],
  );

  const activeCount = useMemo(() => users.filter((u) => u.isActive).length, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">User management</h1>
          <p className="mt-1 text-sm text-text-tertiary">
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total users", value: users.length },
          { label: "Active", value: activeCount },
          { label: "Inactive", value: users.length - activeCount },
          { label: "Roles", value: roles.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <div className="text-2xl font-bold text-text-primary">{value}</div>
            <div className="mt-0.5 text-xs font-medium text-text-tertiary">{label}</div>
          </div>
        ))}
      </div>

      <AdminListCard>
        <AdminTableToolbar>
          <AdminTableToolbarStart>
            <SearchInput
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={
                search
                  ? () => {
                      setSearch("");
                      setPage(1);
                    }
                  : undefined
              }
              placeholder="Search users…"
            />
          </AdminTableToolbarStart>
          <AdminTableToolbarEnd>
            <label htmlFor="user-role-filter" className="sr-only">
              Role
            </label>
            <SelectInput
              id="user-role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="text-sm text-text-secondary"
              wrapperClassName="w-full min-w-[10rem] sm:w-auto"
            >
              <option value="all">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </SelectInput>
          </AdminTableToolbarEnd>
        </AdminTableToolbar>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-text-tertiary">
            <AlertCircle className="h-8 w-8 text-amber-400" />
            <span className="text-sm text-amber-600 dark:text-amber-400">{error}</span>
            <Button variant="outline" size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-text-tertiary">
            <UserX className="h-8 w-8" />
            <span className="text-sm">No users found</span>
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              Add your first user
            </Button>
          </div>
        ) : (
          <>
            <DataTable<SaUser>
              columns={columns}
              data={loading ? [] : pageRows}
              keyExtractor={(u) => String(u.id)}
              tableClassName="min-w-[720px]"
              isLoading={loading}
              loadingRows={pageSize}
              onRowClick={() => setActionMenu(null)}
            />
            {!loading && (
              <>
                <AdminPagination
                  page={Math.min(page, totalPages)}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
                <p className="border-t border-border px-4 py-3 text-xs text-text-tertiary">
                  {totalFiltered} of {users.length} user{users.length !== 1 ? "s" : ""} matching filters
                </p>
              </>
            )}
          </>
        )}
      </AdminListCard>

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
