"use client";

import React, { useState } from "react";
import {
  Monitor,
  CheckCircle2,
  PauseCircle,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Info,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface Register {
  id: string;
  name: string;
  code: string;
  counterType: string;
  temple: string;
  inventoryNode: string;
  printer: string;
  isActive: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────

const COUNTER_TYPES = [
  "All Categories",
  "Prasadam",
  "Tickets",
  "Donations",
  "General Store",
  "Pooja Booking",
];

const INVENTORY_NODES = [
  "Main Prasadam Store",
  "Flower Counter Stock",
  "Ticket Inventory",
  "General Inventory",
];

const MOCK_REGISTERS: Register[] = [
  {
    id: "reg-001",
    name: "Main Counter",
    code: "TMP-REG-001",
    counterType: "Prasadam",
    temple: "Sri Venkateswara Temple",
    inventoryNode: "Main Prasadam Store",
    printer: "Printer A (Main Office)",
    isActive: true,
  },
  {
    id: "reg-002",
    name: "Ticket Counter",
    code: "TMP-REG-002",
    counterType: "Tickets",
    temple: "Sri Venkateswara Temple",
    inventoryNode: "Ticket Inventory",
    printer: "Printer B (Front Gate)",
    isActive: true,
  },
  {
    id: "reg-003",
    name: "Backup Register",
    code: "TMP-REG-003",
    counterType: "General Store",
    temple: "Sri Venkateswara Temple",
    inventoryNode: "General Inventory",
    printer: "—",
    isActive: false,
  },
];

// ── Component ──────────────────────────────────────────────────────

export default function RegistersPage() {
  const [registers] = useState<Register[]>(MOCK_REGISTERS);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRegister, setEditingRegister] = useState<Register | null>(null);

  const activeCount = registers.filter((r) => r.isActive).length;
  const inactiveCount = registers.length - activeCount;

  const filteredRegisters = registers.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDrawer = () => {
    setEditingRegister(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (reg: Register) => {
    setEditingRegister(reg);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Sales / POS / Registers
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mt-1">
            POS Registers
          </h1>
        </div>
        <button
          onClick={openCreateDrawer}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Register
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">
              Total Registers
            </h3>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {registers.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">
              Active Terminals
            </h3>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">
              Offline / Inactive
            </h3>
            <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registers by name or terminal ID..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
        />
      </div>

      {/* Results Count */}
      <p className="text-xs font-medium text-[var(--text-tertiary)]">
        Showing{" "}
        <span className="text-[var(--foreground)]">
          {filteredRegisters.length}
        </span>{" "}
        of {registers.length} registers
      </p>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Register Name
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Terminal ID
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Counter Type
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Inv. Node
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRegisters.map((reg) => (
                <tr
                  key={reg.id}
                  className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                    {reg.name}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-tertiary)] font-mono text-xs">
                    {reg.code}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {reg.counterType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-tertiary)] text-xs">
                    {reg.inventoryNode}
                  </td>
                  <td className="px-6 py-4">
                    {reg.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDrawer(reg)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRegisters.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-[var(--text-tertiary)]"
                  >
                    No registers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Register Drawer */}
      {drawerOpen && (
        <RegisterDrawer
          register={editingRegister}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

// ── Register Create/Edit Drawer ────────────────────────────────────

function RegisterDrawer({
  register,
  onClose,
}: {
  register: Register | null;
  onClose: () => void;
}) {
  const isEdit = !!register;
  const [name, setName] = useState(register?.name || "");
  const [code, setCode] = useState(register?.code || "");
  const [counterType, setCounterType] = useState(
    register?.counterType || ""
  );
  const [inventoryNode, setInventoryNode] = useState(
    register?.inventoryNode || ""
  );
  const [isActive, setIsActive] = useState(register?.isActive ?? true);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isEdit ? "Edit Register" : "Add New Register"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Banner */}
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Registers are linked to physical hardware. Ensure the Terminal ID
              matches the terminal in your local network settings.
            </p>
          </div>

          {/* Section: Register Details */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
              Register Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                  Register Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Counter 3"
                  className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                  Register Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HQ-C3"
                  className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
                />
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Unique identifier for hardware mapping
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                  Temple <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value="Sri Venkateswara Temple"
                  disabled
                  className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-[var(--text-tertiary)] dark:border-zinc-800 dark:bg-zinc-900 cursor-not-allowed"
                />
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Locked to your active workspace unit
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1">
                  Counter Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={counterType}
                  onChange={(e) => setCounterType(e.target.value)}
                  className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors appearance-none"
                >
                  <option value="">Select counter type...</option>
                  {COUNTER_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                  Determines which products are visible on this terminal
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  Inventory Node
                </label>
                <select
                  value={inventoryNode}
                  onChange={(e) => setInventoryNode(e.target.value)}
                  className="mt-1.5 w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900 transition-colors appearance-none"
                >
                  <option value="">Select inventory node...</option>
                  {INVENTORY_NODES.map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Active Status
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                Allow logins to this register
              </p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className="relative"
            >
              {isActive ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-[var(--foreground)] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 h-11 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {isEdit ? "Save Changes" : "Create Register"}
          </button>
        </div>
      </div>
    </>
  );
}
