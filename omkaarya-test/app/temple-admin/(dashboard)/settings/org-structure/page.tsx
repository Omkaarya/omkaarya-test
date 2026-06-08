"use client";

import { useEffect, useState } from "react";
import {
  Plus, ChevronRight, ChevronDown, Edit2, Trash2,
  Package, X, Info, Users, MapPin, Check, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Input } from "@/app/components/ds/atoms/Input";
import { Switch } from "@/app/components/ds/atoms/Switch";
import { fetchTempleAdminJson, type SettingsAreaResponse } from "@/lib/temple-admin-api";

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

const TYPE_COLOR: Record<UnitType, "brand" | "success" | "warning" | "error" | "blue" | "gray" | "orange"> = {
  "Main Temple":      "brand",
  "Madapalli":        "warning",
  "Moolasthanam":     "error",
  "Mandapam":         "blue",
  "Store":            "success",
  "Gopuram":          "orange",
  "Office":           "gray",
  "Donation Counter": "success",
  "Custom":           "gray",
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
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      <div
        onClick={() => onSelect(unit)}
        className={`
          flex items-center gap-3 px-4 py-4 cursor-pointer rounded-2xl transition-all group border-2
          ${isSelected
            ? "bg-brand-50/20 dark:bg-brand-950/10 border-brand shadow-sm shadow-brand/5"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-900 border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"}
        `}
        style={{ marginLeft: depth * 24 }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform ${expanded ? "rotate-90" : ""} ${hasChildren ? "text-brand" : "text-zinc-300 dark:text-zinc-700"}`}
        >
          {hasChildren ? <ChevronRight className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />}
        </button>

        {/* Name + code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <TruncateText className="text-[13px] font-black uppercase tracking-tight text-zinc-900 dark:text-white" title={unit.name}>
              {unit.name}
            </TruncateText>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">#{unit.code}</span>
            <Badge color={TYPE_COLOR[unit.type]} size="sm" variant="subtle">{unit.type}</Badge>
            {unit.managesInventory && (
              <Badge color="success" size="sm" variant="subtle" leadingIcon={<Package className="w-3 h-3" />}>INV</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={(e) => { e.stopPropagation(); onEdit(unit); }}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-tight"
            onClick={(e) => { e.stopPropagation(); onAddChild(unit.id); }}
          >
            + Child
          </Button>
          {unit.parentId !== null && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-danger hover:border-danger hover:bg-danger-50"
              onClick={(e) => { e.stopPropagation(); onDelete(unit.id); }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
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
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button type="button" className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              {mode === "create" ? "Create Unit" : "Edit Unit"}
            </h2>
            {parentName && (
              <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Sub-unit of <span className="text-brand">{parentName}</span></p>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              Unit Name
            </label>
            <Input
              value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Moolasthanam"
              inputSize="lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
              Internal Code
            </label>
            <Input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MLSTH"
              inputSize="lg"
              className="font-mono"
            />
            <p className="text-[10px] font-medium text-zinc-400 px-1 uppercase tracking-tight">Used for inventory tracking and reporting.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Unit Type</label>
            <div className="relative">
              <select
                value={type} onChange={(e) => setType(e.target.value as UnitType)}
                className="w-full h-12 pl-4 pr-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none cursor-pointer"
              >
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Manages Inventory Toggle */}
          <div className="flex items-start gap-4 bg-brand-50/10 dark:bg-brand-950/5 border border-brand/10 rounded-[24px] p-6">
            <div className="mt-1">
              <Switch checked={managesInventory} onChange={setManagesInventory} />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Track Inventory Stock</p>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Enable this to allow this unit to receive and track stock for pooja items, food, or retail products.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Unit Head / Supervisor</label>
            <Input
              value={headOfUnit} onChange={(e) => setHeadOfUnit(e.target.value)}
              placeholder="e.g. Sri Annamalai Pujari"
              inputSize="lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Description</label>
            <textarea
              rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose or physical location of this unit…"
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-8 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
          <Button variant="outline" size="lg" className="flex-1 rounded-2xl h-14" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" className="flex-1 rounded-2xl h-14" onClick={handleSave} disabled={!name.trim() || !code.trim()} leadingIcon={<Check className="w-5 h-5" />}>
            Save Unit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Unit Details Panel ─────────────────────────────────────────────

function UnitDetailsPanel({ unit }: { unit: TempleUnit | null }) {
  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 py-20 px-8 text-center animate-in fade-in duration-700">
        <div className="w-16 h-16 rounded-[24px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-200">
           <MapPin className="w-8 h-8" />
        </div>
        <div>
           <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Select a Unit</h4>
           <p className="text-xs font-medium text-zinc-500 mt-1">Select any unit from the organizational tree to view detailed information and history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Unit Name</p>
          <TruncateText className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white" title={unit.name}>
            {unit.name}
          </TruncateText>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Internal Code</p>
            <p className="text-sm font-mono font-bold text-brand bg-brand-50/30 dark:bg-brand-950/20 px-3 py-1.5 rounded-xl border border-brand/10 inline-block">#{unit.code}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Category</p>
            <Badge color={TYPE_COLOR[unit.type]} size="md">{unit.type}</Badge>
          </div>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                <Package className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Inventory Tracking</p>
                <p className={`text-sm font-bold ${unit.managesInventory ? "text-emerald-500" : "text-zinc-500"}`}>
                  {unit.managesInventory ? "Active — Stock levels monitored" : "Inactive"}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                <Users className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Assigned Head</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {unit.headOfUnit || "Unassigned"}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                <MapPin className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Sub-Units</p>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {unit.children.length} Active Nodes
                </p>
             </div>
          </div>
        </div>

        {unit.description && (
          <div className="p-6 rounded-[24px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Notes & Remarks</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{unit.description}</p>
          </div>
        )}
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
  const [tree, setTree] = useState<TempleUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<TempleUnit | null>(null);
  const [drawer, setDrawer] = useState<{
    mode: "create" | "edit";
    parentId?: string | null;
    initial?: Partial<TempleUnit>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTempleAdminJson<SettingsAreaResponse>("/api/temple-admin/settings/org_tree");
        const loaded = (data.payload?.tree as TempleUnit[]) ?? [];
        setTree(Array.isArray(loaded) ? loaded : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load org structure.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistTree = async (next: TempleUnit[]) => {
    setSaving(true);
    setError(null);
    try {
      await fetchTempleAdminJson("/api/temple-admin/settings/org_tree", {
        method: "PUT",
        body: JSON.stringify({ payload: { tree: next } }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save org structure.");
    } finally {
      setSaving(false);
    }
  };

  const allUnits = flattenTree(tree);

  const parentName = drawer?.parentId
    ? allUnits.find((u) => u.id === drawer.parentId)?.name
    : undefined;

  const handleSave = async (data: Omit<TempleUnit, "id" | "children">) => {
    let next = tree;
    if (drawer?.mode === "create") {
      const newUnit: TempleUnit = { ...data, id: generateId(), children: [] };
      next = insertUnit(tree, newUnit, drawer.parentId ?? null);
    } else if (drawer?.mode === "edit" && drawer.initial?.id) {
      const updated: TempleUnit = {
        ...data,
        id: drawer.initial.id,
        children: allUnits.find((u) => u.id === drawer.initial?.id)?.children ?? [],
      };
      next = updateUnit(tree, updated);
      setSelectedUnit(updated);
    }
    setTree(next);
    setDrawer(null);
    await persistTree(next);
  };

  const handleDelete = async (id: string) => {
    const next = deleteUnit(tree, id);
    setTree(next);
    if (selectedUnit?.id === id) setSelectedUnit(null);
    await persistTree(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-zinc-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading organizational structure…
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-full animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Organizational Structure</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Define physical units for space management and inventory tracking.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          leadingIcon={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          onClick={() => setDrawer({ mode: "create", parentId: null })}
          className="rounded-2xl h-14 px-8"
        >
          {saving ? "Saving…" : "Create Root Unit"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

        {/* Tree Container */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px]">
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
            <div>
               <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Temple Unit Tree</h2>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tight mt-0.5">{allUnits.length} Total Units Found</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-tight rounded-lg">Expand All</Button>
               <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-tight rounded-lg">Collapse All</Button>
            </div>
          </div>
          <div className="p-6 space-y-2 overflow-x-auto">
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
              <div className="flex flex-col items-center gap-4 py-32 text-center animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-[24px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
                   <MapPin className="w-8 h-8" />
                </div>
                <div>
                   <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Empty Structure</h4>
                   <p className="text-xs font-medium text-zinc-500 mt-1 mb-6">No organizational units have been defined yet.</p>
                   <Button variant="primary" size="sm" onClick={() => setDrawer({ mode: "create", parentId: null })}>Add Root Unit</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="lg:sticky lg:top-8 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
            <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Unit Insights</h2>
          </div>
          <div className="p-8">
            <UnitDetailsPanel unit={selectedUnit} />
          </div>
          {selectedUnit && (
            <div className="px-8 pb-8 flex flex-col gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDrawer({ mode: "edit", parentId: selectedUnit.parentId, initial: selectedUnit })}
                className="w-full rounded-2xl h-14 uppercase text-[11px] font-black tracking-[0.1em]"
                leadingIcon={<Edit2 className="w-4 h-4" />}
              >
                Edit Parameters
              </Button>
              <p className="text-[10px] text-center font-medium text-zinc-400 px-4">Modifying unit parameters may affect inventory and staff assignments linked to this unit.</p>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Overlay */}
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
