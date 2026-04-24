"use client";

import { useState } from "react";
import {
  Plus, ChevronRight, ChevronDown, Edit2, Trash2,
  Package, X, Info, Users, MapPin,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type UnitType =
  | "Main Temple"
  | "Madapalli"
  | "Moolasthanam"
  | "Mandapam"
  | "Store"
  | "Gopuram"
  | "Office"
  | "Donation Counter"
  | "Custom";

type TempleUnit = {
  id: string;
  name: string;
  code: string;
  type: UnitType;
  managesInventory: boolean;
  description?: string;
  headOfUnit?: string;
  parentId: string | null;
  children: TempleUnit[];
};

// ── Mock Data ──────────────────────────────────────────────────────

const INITIAL_TREE: TempleUnit[] = [
  {
    id: "1", name: "Sri Murugan Temple", code: "SMT", type: "Main Temple",
    managesInventory: false, description: "Main temple complex — root unit.",
    headOfUnit: "Sri Ramesh Iyer", parentId: null,
    children: [
      {
        id: "2", name: "Moolasthanam", code: "MLSTH", type: "Moolasthanam",
        managesInventory: true, description: "Inner sanctum — tracks flowers, oil, lamps.",
        headOfUnit: "Sri Annamalai Pujari", parentId: "1", children: [],
      },
      {
        id: "3", name: "Madapalli", code: "MDPL", type: "Madapalli",
        managesInventory: true, description: "Temple kitchen — tracks raw ingredients.",
        headOfUnit: "Smt. Kamala Devi", parentId: "1",
        children: [
          {
            id: "6", name: "Prasad Preparation Area", code: "MDPL-PR", type: "Custom",
            managesInventory: true, description: "Sub-unit for prasad preparation.",
            headOfUnit: "", parentId: "3", children: [],
          },
        ],
      },
      {
        id: "4", name: "Vasantha Mandapam", code: "VSTMND", type: "Mandapam",
        managesInventory: true, description: "Event hall — tracks decorations, lamps, flowers.",
        headOfUnit: "Sri Karthik Raja", parentId: "1", children: [],
      },
      {
        id: "5", name: "Administrative Office", code: "ADMOFF", type: "Office",
        managesInventory: false, description: "Admin and records.",
        headOfUnit: "Smt. Priya Nair", parentId: "1", children: [],
      },
    ],
  },
];

// ── Unit Type Config ───────────────────────────────────────────────

const UNIT_TYPES: UnitType[] = [
  "Main Temple", "Madapalli", "Moolasthanam", "Mandapam",
  "Store", "Gopuram", "Office", "Donation Counter", "Custom",
];

const TYPE_BADGE: Record<UnitType, string> = {
  "Main Temple":      "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  "Madapalli":        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  "Moolasthanam":     "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  "Mandapam":         "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  "Store":            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  "Gopuram":          "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  "Office":           "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Donation Counter": "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  "Custom":           "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

// ── Helper: flatten tree ───────────────────────────────────────────

function flattenTree(units: TempleUnit[]): TempleUnit[] {
  return units.flatMap((u) => [u, ...flattenTree(u.children)]);
}

function generateId() { return Date.now().toString(); }

function autoCode(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 6);
}

// ── Tree Row ───────────────────────────────────────────────────────

function UnitRow({
  unit, depth, selected, onSelect, onAddChild, onEdit, onDelete,
}: {
  unit: TempleUnit; depth: number; selected: string | null;
  onSelect: (u: TempleUnit) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (u: TempleUnit) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = unit.children.length > 0;
  const isSelected = selected === unit.id;

  return (
    <div>
      <div
        onClick={() => onSelect(unit)}
        className={[
          "flex items-center gap-2 px-4 py-3 cursor-pointer rounded-xl transition-colors group",
          isSelected
            ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent",
        ].join(" ")}
        style={{ marginLeft: depth * 20 }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="w-5 h-5 flex items-center justify-center shrink-0 text-zinc-400"
        >
          {hasChildren
            ? expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            : <span className="w-4 h-4" />}
        </button>

        {/* Name + code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{unit.name}</span>
            <span className="text-[10px] font-mono text-zinc-400">({unit.code})</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[unit.type]}`}>
              {unit.type}
            </span>
            {unit.managesInventory && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Package className="w-3 h-3" /> Inventory
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(unit); }}
            className="px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddChild(unit.id); }}
            className="px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:text-[var(--brand-primary)] rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
          >
            + Child
          </button>
          {unit.parentId !== null && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(unit.id); }}
              className="px-2 py-1 text-[11px] font-semibold text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && unit.children.map((child) => (
        <UnitRow
          key={child.id} unit={child} depth={depth + 1}
          selected={selected} onSelect={onSelect}
          onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ── Create / Edit Drawer ───────────────────────────────────────────

function UnitDrawer({
  mode, initial, parentName, onClose, onSave,
}: {
  mode: "create" | "edit";
  initial?: Partial<TempleUnit>;
  parentName?: string;
  onClose: () => void;
  onSave: (data: Omit<TempleUnit, "id" | "children">) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<UnitType>(initial?.type ?? "Custom");
  const [managesInventory, setManagesInventory] = useState(initial?.managesInventory ?? false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [headOfUnit, setHeadOfUnit] = useState(initial?.headOfUnit ?? "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial?.code) setCode(autoCode(v));
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;
    onSave({
      name: name.trim(), code: code.trim().toUpperCase(),
      type, managesInventory,
      description: description.trim(),
      headOfUnit: headOfUnit.trim(),
      parentId: initial?.parentId ?? null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {mode === "create" ? "Create Unit" : "Edit Unit"}
            </h2>
            {parentName && (
              <p className="text-xs text-zinc-500 mt-0.5">Child of: <strong>{parentName}</strong></p>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Moolasthanam"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MLSTH"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
            />
            <p className="text-[10px] text-zinc-400">Short unique code. Auto-suggested from name.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Type</label>
            <select
              value={type} onChange={(e) => setType(e.target.value as UnitType)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]"
            >
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Manages Inventory Toggle */}
          <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setManagesInventory(!managesInventory)}
              className={[
                "relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5",
                managesInventory ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600",
              ].join(" ")}
            >
              <span className={[
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                managesInventory ? "translate-x-5" : "translate-x-0",
              ].join(" ")} />
            </button>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Manages Inventory</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                When enabled, this unit can receive and track pooja item stock.
                A default inventory node will be automatically linked.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Head of Unit</label>
            <input
              value={headOfUnit} onChange={(e) => setHeadOfUnit(e.target.value)}
              placeholder="e.g. Sri Annamalai Pujari"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of this unit…"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            disabled={!name.trim() || !code.trim()}
            className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unit Details Panel ─────────────────────────────────────────────

function UnitDetailsPanel({ unit }: { unit: TempleUnit | null }) {
  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400 gap-3">
        <Info className="w-8 h-8" />
        <p className="text-sm">Select a unit to view details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Name</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{unit.name}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Code</p>
          <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">{unit.code}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Type</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_BADGE[unit.type]}`}>
            {unit.type}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Manages Inventory</p>
          <span className={`flex items-center gap-1.5 text-sm font-semibold ${unit.managesInventory ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
            <Package className="w-4 h-4" />
            {unit.managesInventory ? "Yes — Inventory tracked" : "No"}
          </span>
        </div>
        {unit.headOfUnit && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Head of Unit</p>
            <span className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <Users className="w-4 h-4 text-zinc-400" />
              {unit.headOfUnit}
            </span>
          </div>
        )}
        {unit.description && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Description</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{unit.description}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Sub-units</p>
          <span className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-4 h-4 text-zinc-400" />
            {unit.children.length} child unit{unit.children.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Tree helpers ───────────────────────────────────────────────────

function insertUnit(tree: TempleUnit[], newUnit: TempleUnit, parentId: string | null): TempleUnit[] {
  if (parentId === null) return [...tree, newUnit];
  return tree.map((u) => ({
    ...u,
    children: u.id === parentId
      ? [...u.children, newUnit]
      : insertUnit(u.children, newUnit, parentId),
  }));
}

function updateUnit(tree: TempleUnit[], updated: TempleUnit): TempleUnit[] {
  return tree.map((u) =>
    u.id === updated.id ? { ...updated, children: u.children } : { ...u, children: updateUnit(u.children, updated) }
  );
}

function deleteUnit(tree: TempleUnit[], id: string): TempleUnit[] {
  return tree.filter((u) => u.id !== id).map((u) => ({ ...u, children: deleteUnit(u.children, id) }));
}

// ── Main Page ──────────────────────────────────────────────────────

export default function OrgStructurePage() {
  const [tree, setTree] = useState<TempleUnit[]>(INITIAL_TREE);
  const [selectedUnit, setSelectedUnit] = useState<TempleUnit | null>(null);
  const [drawer, setDrawer] = useState<{
    mode: "create" | "edit";
    parentId?: string | null;
    initial?: Partial<TempleUnit>;
  } | null>(null);

  const allUnits = flattenTree(tree);

  const parentName = drawer?.parentId
    ? allUnits.find((u) => u.id === drawer.parentId)?.name
    : undefined;

  const handleSave = (data: Omit<TempleUnit, "id" | "children">) => {
    if (drawer?.mode === "create") {
      const newUnit: TempleUnit = { ...data, id: generateId(), children: [] };
      setTree((prev) => insertUnit(prev, newUnit, drawer.parentId ?? null));
    } else if (drawer?.mode === "edit" && drawer.initial?.id) {
      const updated: TempleUnit = {
        ...data,
        id: drawer.initial.id,
        children: allUnits.find((u) => u.id === drawer.initial?.id)?.children ?? [],
      };
      setTree((prev) => updateUnit(prev, updated));
      setSelectedUnit(updated);
    }
    setDrawer(null);
  };

  const handleDelete = (id: string) => {
    setTree((prev) => deleteUnit(prev, id));
    if (selectedUnit?.id === id) setSelectedUnit(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Organizational Structure
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Define your temple's physical units for space management and inventory tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawer({ mode: "create", parentId: null })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Create Root Unit
        </button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* Tree */}
        <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Temple Unit Tree</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{allUnits.length} units defined</p>
          </div>
          <div className="p-4 space-y-1">
            {tree.map((root) => (
              <UnitRow
                key={root.id} unit={root} depth={0}
                selected={selectedUnit?.id ?? null}
                onSelect={setSelectedUnit}
                onAddChild={(parentId) => setDrawer({ mode: "create", parentId })}
                onEdit={(u) => setDrawer({ mode: "edit", parentId: u.parentId, initial: u })}
                onDelete={handleDelete}
              />
            ))}
            {tree.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
                <MapPin className="w-8 h-8" />
                <p className="text-sm">No units defined yet.</p>
                <button
                  type="button"
                  onClick={() => setDrawer({ mode: "create", parentId: null })}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  Create your first root unit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Unit Details</h2>
          </div>
          <div className="px-5 py-5">
            <UnitDetailsPanel unit={selectedUnit} />
          </div>
          {selectedUnit && (
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setDrawer({ mode: "edit", parentId: selectedUnit.parentId, initial: selectedUnit })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Unit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <UnitDrawer
          mode={drawer.mode}
          initial={drawer.initial}
          parentName={parentName}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
