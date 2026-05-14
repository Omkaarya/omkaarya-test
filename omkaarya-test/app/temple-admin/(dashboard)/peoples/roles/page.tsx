"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import {
  fetchTempleAdminJson,
  type Role,
  type RolePermission,
} from "@/lib/temple-admin-api";

const MODULES = [
  { key: "core", label: "Core" },
  { key: "inventory", label: "Inventory" },
  { key: "sales", label: "Sales" },
  { key: "finance", label: "Finance" },
  { key: "manufacturing", label: "Manufacturing" },
  { key: "stock_transfer", label: "Stock Transfer" },
  { key: "reports", label: "Reports" },
  { key: "logs", label: "Logs" },
  { key: "bookings", label: "Bookings" },
  { key: "master_data", label: "Master Data" },
  { key: "peoples", label: "Peoples" },
  { key: "public_site", label: "Public Site" },
  { key: "settings", label: "Settings" },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, RolePermission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<{ items: Role[] }>("/api/temple-admin/peoples/roles");
      setRoles(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const toggleExpand = async (roleId: string) => {
    if (expandedRoleId === roleId) {
      setExpandedRoleId(null);
      return;
    }
    setExpandedRoleId(roleId);
    if (!permissionsByRole[roleId]) {
      try {
        const data = await fetchTempleAdminJson<{ items: RolePermission[] }>(`/api/temple-admin/peoples/roles/${roleId}/permissions`);
        setPermissionsByRole((prev) => ({ ...prev, [roleId]: data.items }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load permissions.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">Roles & Permissions</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Define what each role can do across modules.
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus className="h-4 w-4" />}>Add Role</Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading roles…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const isExpanded = expandedRoleId === role.id;
            const perms = permissionsByRole[role.id] ?? [];
            const permMap = new Map<string, RolePermission>();
            perms.forEach((p) => permMap.set(p.module_key, p));
            return (
              <div
                key={role.id}
                className={`flex flex-col rounded-[24px] border transition-all duration-300 bg-white dark:bg-zinc-950 ${isExpanded ? "ring-2 ring-brand-500 border-brand-500 shadow-xl" : "border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700"}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{role.name}</h3>
                      {role.is_system && <Lock className="h-3.5 w-3.5 text-zinc-400" />}
                    </div>
                    <Badge color="brand" size="sm">{role.required_plan}</Badge>
                  </div>
                  <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[32px]">
                    {role.description ?? "No description."}
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {role.permission_count}{" "}
                        <span className="text-zinc-400 font-medium">permissions</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {role.user_count}{" "}
                        <span className="text-zinc-400 font-medium">users</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => toggleExpand(role.id)}
                      leadingIcon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    >
                      {isExpanded ? "Hide Permissions" : "View Permissions"}
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                          <tr>
                            <th className="px-6 py-3">Module</th>
                            <th className="px-2 py-3 text-center">Create</th>
                            <th className="px-2 py-3 text-center">Read</th>
                            <th className="px-2 py-3 text-center">Update</th>
                            <th className="px-2 py-3 text-center">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {MODULES.map((m) => {
                            const perm = permMap.get(m.key);
                            return (
                              <tr key={m.key} className="text-zinc-600 dark:text-zinc-400">
                                <td className="px-6 py-3 font-black text-zinc-800 dark:text-zinc-200">{m.label}</td>
                                <PermCell allowed={!!perm?.can_create} />
                                <PermCell allowed={!!perm?.can_read} />
                                <PermCell allowed={!!perm?.can_update} />
                                <PermCell allowed={!!perm?.can_delete} />
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-100 dark:border-zinc-800 rounded-b-[24px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {role.is_system ? "System role — permissions are read-only." : "Custom role"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PermCell({ allowed }: { allowed: boolean }) {
  return (
    <td className="px-2 py-3">
      <div className="flex justify-center">
        <div className={`w-4 h-4 rounded flex items-center justify-center ${allowed ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-zinc-100 dark:bg-zinc-900"}`}>
          {allowed ? (
            <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={4} />
          ) : (
            <X className="h-2.5 w-2.5 text-zinc-300 dark:text-zinc-700" strokeWidth={4} />
          )}
        </div>
      </div>
    </td>
  );
}
