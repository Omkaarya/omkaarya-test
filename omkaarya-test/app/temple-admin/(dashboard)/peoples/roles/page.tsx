"use client";

import { useState } from "react";
import { 
  Plus, 
  ShieldAlert, 
  Check, 
  X, 
  Lock, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  MoreVertical
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";

const MODULES = [
  "Core",
  "Inventory",
  "Sales",
  "Finance",
  "Manufacturing",
  "Pawning",
  "Stock Transfer",
  "Reports",
  "Logs"
];

type RoleData = {
  id: string;
  name: string;
  description: string;
  permissions: number;
  totalPermissions: number;
  users: number;
  isSystem: boolean;
  plan: "Prarambha" | "Sankalpa" | "Aaradhana";
};

export default function RolesPermissionsPage() {
  const [currentPlan] = useState<"Prarambha" | "Sankalpa" | "Aaradhana">("Prarambha");
  const [expandedRole, setExpandedRole] = useState<string | null>("super-admin");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const roles: RoleData[] = [
    { 
      id: "super-admin", 
      name: "Super Admin", 
      description: "Full system access — cannot be restricted.", 
      permissions: 45, 
      totalPermissions: 45, 
      users: 1, 
      isSystem: true,
      plan: "Prarambha"
    },
    { 
      id: "admin", 
      name: "Admin", 
      description: "Full operational access, limited system settings.", 
      permissions: 44, 
      totalPermissions: 45, 
      users: 2, 
      isSystem: true,
      plan: "Prarambha"
    },
    { 
      id: "manager", 
      name: "Manager", 
      description: "Operational oversight, approvals and reporting.", 
      permissions: 24, 
      totalPermissions: 45, 
      users: 4, 
      isSystem: true,
      plan: "Sankalpa"
    },
    { 
      id: "cashier", 
      name: "Cashier", 
      description: "POS sales and basic inventory view.", 
      permissions: 6, 
      totalPermissions: 45, 
      users: 6, 
      isSystem: true,
      plan: "Prarambha"
    },
    { 
      id: "inventory-manager", 
      name: "Inventory Manager", 
      description: "Full inventory control, purchases and manufacturing.", 
      permissions: 16, 
      totalPermissions: 45, 
      users: 2, 
      isSystem: true,
      plan: "Sankalpa"
    },
  ];

  const canAccessRole = (rolePlan: string) => {
    if (currentPlan === "Aaradhana") return true;
    if (currentPlan === "Sankalpa") return rolePlan !== "Aaradhana";
    return rolePlan === "Prarambha";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-7xl mx-auto pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
               Roles & Permissions
             </h1>
             <Badge color="brand" size="sm">{currentPlan} Plan</Badge>
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Define what each role can do across modules.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => currentPlan === "Prarambha" ? setShowUpgradeModal(true) : null}
          leadingIcon={<Plus className="h-4 w-4" />}
        >
          Add Role
        </Button>
      </div>

      {/* ── Roles Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const isExpanded = expandedRole === role.id;
          const isLocked = !canAccessRole(role.plan);

          return (
            <div 
              key={role.id}
              className={`
                flex flex-col rounded-[24px] border transition-all duration-300 bg-white dark:bg-zinc-950
                ${isExpanded ? "ring-2 ring-brand-500 border-brand-500 shadow-xl lg:col-span-1" : "border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700"}
                ${isLocked ? "opacity-60 grayscale" : ""}
              `}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{role.name}</h3>
                    {role.isSystem && <Lock className="h-3.5 w-3.5 text-zinc-400" />}
                  </div>
                  {isLocked && (
                    <Badge color="warning" size="sm" onClick={() => setShowUpgradeModal(true)}>
                       Upgrade
                    </Badge>
                  )}
                </div>
                
                <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[32px]">
                  {role.description}
                </p>

                <div className="mt-6 flex items-center gap-6">
                   <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {role.permissions} <span className="text-zinc-400 font-medium">/ {role.totalPermissions} permissions</span>
                      </p>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {role.users} <span className="text-zinc-400 font-medium">users</span>
                      </p>
                   </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl"
                    onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                    leadingIcon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                   >
                     {isExpanded ? "Hide Permissions" : "View Permissions"}
                   </Button>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl px-3"
                    leadingIcon={<Copy className="h-4 w-4" />}
                   >
                     Clone
                   </Button>
                </div>
              </div>

              {/* ── Expandable Permission Table ── */}
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
                            {MODULES.map((mod) => (
                              <tr key={mod} className="text-zinc-600 dark:text-zinc-400">
                                 <td className="px-6 py-3 font-black text-zinc-800 dark:text-zinc-200">{mod}</td>
                                 <td className="px-2 py-3">
                                    <div className="flex justify-center">
                                       <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={4} />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-2 py-3">
                                    <div className="flex justify-center">
                                       <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={4} />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-2 py-3">
                                    <div className="flex justify-center">
                                       <div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                          <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={4} />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-2 py-3">
                                    <div className="flex justify-center">
                                       <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                          <X className="h-2.5 w-2.5 text-zinc-300 dark:text-zinc-700" strokeWidth={4} />
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-100 dark:border-zinc-800 rounded-b-[24px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> System role — permissions are read-only.
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Upgrade Modal (Reuse same logic) ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden p-1">
             <div className="bg-brand-50 dark:bg-brand-950/30 p-8 text-center rounded-[31px]">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-lg mb-6">
                   <ShieldAlert className="w-8 h-8 text-brand" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Upgrade to Unlock</h2>
                <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Advanced roles and custom permissions are available in our premium tiers.
                </p>
                
                <div className="mt-8 flex flex-col gap-3">
                   <Button variant="primary" size="lg" className="w-full py-6 rounded-2xl font-black shadow-lg shadow-brand-500/20 hover:scale-[1.02]">
                      Go to Subscription Page
                   </Button>
                   <button 
                     onClick={() => setShowUpgradeModal(false)}
                     className="w-full py-4 bg-transparent text-zinc-400 hover:text-zinc-600 text-sm font-bold"
                   >
                      Maybe Later
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
