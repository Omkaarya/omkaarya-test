"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, ChevronRight, Package } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

type UOMKind = "Base Unit" | "Bulk Unit";
type UOMType = "Unit (count)" | "Weight" | "Volume" | "Length";

type UOM = {
  id: string;
  kind: UOMKind;
  name: string;
  abbreviation: string;
  type: UOMType;
  // Bulk unit fields
  baseUnitId?: string;
  quantityPerBulk?: number;
};

// ── Seed Data ──────────────────────────────────────────────────────

const SEED_UOMS: UOM[] = [
  { id: "1", kind: "Base Unit", name: "Piece",    abbreviation: "pc",  type: "Unit (count)" },
  { id: "2", kind: "Base Unit", name: "Kilogram", abbreviation: "kg",  type: "Weight" },
  { id: "3", kind: "Base Unit", name: "Gram",     abbreviation: "g",   type: "Weight" },
  { id: "4", kind: "Base Unit", name: "Litre",    abbreviation: "L",   type: "Volume" },
  { id: "5", kind: "Base Unit", name: "Millilitre", abbreviation: "mL", type: "Volume" },
  { id: "6", kind: "Base Unit", name: "Metre",    abbreviation: "m",   type: "Length" },
  { id: "7", kind: "Bulk Unit", name: "Dozen",    abbreviation: "dz",  type: "Unit (count)", baseUnitId: "1", quantityPerBulk: 12 },
  { id: "8", kind: "Bulk Unit", name: "Box",      abbreviation: "box", type: "Unit (count)", baseUnitId: "1", quantityPerBulk: 24 },
  { id: "9", kind: "Bulk Unit", name: "Bag (5kg)", abbreviation: "bag", type: "Weight",       baseUnitId: "2", quantityPerBulk: 5 },
];

const UOM_TYPES: UOMType[] = ["Unit (count)", "Weight", "Volume", "Length"];

const TYPE_BADGE: Record<UOMType, string> = {
  "Unit (count)": "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  "Weight":       "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  "Volume":       "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  "Length":       "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
};

// ── UOM Form Drawer ────────────────────────────────────────────────

function UOMDrawer({
  initial, baseUnits, onClose, onSave,
}: {
  initial?: UOM;
  baseUnits: UOM[];
  onClose: () => void;
  onSave: (data: Omit<UOM, "id">) => void;
}) {
  const [kind, setKind] = useState<UOMKind>(initial?.kind ?? "Base Unit");
  const [name, setName] = useState(initial?.name ?? "");
  const [abbreviation, setAbbreviation] = useState(initial?.abbreviation ?? "");
  const [type, setType] = useState<UOMType>(initial?.type ?? "Unit (count)");
  const [baseUnitId, setBaseUnitId] = useState(initial?.baseUnitId ?? "");
  const [quantityPerBulk, setQuantityPerBulk] = useState(String(initial?.quantityPerBulk ?? ""));
  const [baseSearch, setBaseSearch] = useState("");

  const filteredBases = baseUnits.filter((u) =>
    u.name.toLowerCase().includes(baseSearch.toLowerCase())
  );

  const canSave =
    name.trim() &&
    abbreviation.trim() &&
    (kind === "Base Unit" || (baseUnitId && quantityPerBulk));

  const handleSave = () => {
    if (!canSave) return;
    const data: Omit<UOM, "id"> = {
      kind, name: name.trim(), abbreviation: abbreviation.trim(), type,
      ...(kind === "Bulk Unit" ? { baseUnitId, quantityPerBulk: Number(quantityPerBulk) } : {}),
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-950 z-10">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {initial ? "Edit Unit of Measure" : "New Unit of Measure"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Define base or bulk measurement units</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 flex-1">

          {/* Unit Type */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Unit Type</p>
            <div className="grid grid-cols-2 gap-3">
              {(["Base Unit", "Bulk Unit"] as UOMKind[]).map((k) => (
                <button
                  key={k} type="button"
                  onClick={() => setKind(k)}
                  className={[
                    "flex flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 transition-all text-left",
                    kind === k
                      ? "border-[var(--brand-primary)] bg-orange-50 dark:bg-orange-950/20"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <div className={[
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                      kind === k ? "border-[var(--brand-primary)]" : "border-zinc-300 dark:border-zinc-600",
                    ].join(" ")}>
                      {kind === k && <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />}
                    </div>
                    <span className={`text-sm font-bold ${kind === k ? "text-[var(--brand-primary)]" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {k}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-snug pl-6">
                    {k === "Base Unit"
                      ? "Fundamental unit (e.g. Piece, Kg, Litre)"
                      : "Composite unit composed of base units (e.g. Box = 12 Pcs)"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Basic Information</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                UOM Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder={kind === "Base Unit" ? "e.g. Piece, Kilogram, Litre" : "e.g. Box, Carton, Case"}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Abbreviation <span className="text-red-500">*</span>
                </label>
                <input
                  value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)}
                  placeholder={kind === "Base Unit" ? "e.g. pcs, kg, L" : "e.g. BOX, CTN"}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Type</label>
                <select
                  value={type} onChange={(e) => setType(e.target.value as UOMType)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]"
                >
                  {UOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Unit Composition */}
          {kind === "Bulk Unit" && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Bulk Unit Composition</p>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
                💡 Define how many base units make up one bulk unit. For example: 1 Box = 12 Pieces.
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Base Unit selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Base Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={baseUnitId} onChange={(e) => setBaseUnitId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)]"
                    >
                      <option value="">Select base unit…</option>
                      {baseUnits.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Qty per Bulk Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="1" value={quantityPerBulk}
                    onChange={(e) => setQuantityPerBulk(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 ring-[var(--brand-primary)] placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Preview */}
              {baseUnitId && quantityPerBulk && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Package className="w-4 h-4 shrink-0" />
                  1 {name || "Bulk Unit"} = {quantityPerBulk} {baseUnits.find((u) => u.id === baseUnitId)?.name ?? "Base Units"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-950">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {initial ? "Save Changes" : "Create UOM"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function UnitsOfMeasurePage() {
  const [uoms, setUoms] = useState<UOM[]>(SEED_UOMS);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<"All" | UOMKind>("All");
  const [drawer, setDrawer] = useState<{ open: true; editing?: UOM } | null>(null);

  const baseUnits = uoms.filter((u) => u.kind === "Base Unit");

  const filtered = uoms.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.abbreviation.toLowerCase().includes(search.toLowerCase());
    const matchKind = filterKind === "All" || u.kind === filterKind;
    return matchSearch && matchKind;
  });

  const handleSave = (data: Omit<UOM, "id">) => {
    if (drawer?.editing) {
      setUoms((prev) => prev.map((u) => u.id === drawer.editing!.id ? { ...u, ...data } : u));
    } else {
      setUoms((prev) => [...prev, { ...data, id: Date.now().toString() }]);
    }
    setDrawer(null);
  };

  const handleDelete = (id: string) => {
    setUoms((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Units of Measure
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Define base and bulk measurement units used across inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawer({ open: true })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> New UOM
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total UOMs",  value: uoms.length },
          { label: "Base Units",  value: uoms.filter((u) => u.kind === "Base Unit").length },
          { label: "Bulk Units",  value: uoms.filter((u) => u.kind === "Bulk Unit").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 shadow-sm">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</div>
            <div className="text-xs font-medium text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search UOMs…"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ring-[var(--brand-primary)] transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Base Unit", "Bulk Unit"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setFilterKind(k)}
                className={[
                  "px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                  filterKind === k
                    ? "bg-[var(--brand-primary)] text-white"
                    : "border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900",
                ].join(" ")}>
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Abbreviation</th>
                <th className="px-6 py-4">Kind</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Composition</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {filtered.map((uom) => {
                const base = uom.baseUnitId ? uoms.find((u) => u.id === uom.baseUnitId) : null;
                return (
                  <tr key={uom.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{uom.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">
                        {uom.abbreviation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        uom.kind === "Base Unit"
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                      }`}>
                        {uom.kind}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[uom.type]}`}>
                        {uom.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {base ? (
                        <span className="flex items-center gap-1.5">
                          1 {uom.name}
                          <ChevronRight className="w-3 h-3" />
                          {uom.quantityPerBulk} {base.name}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => setDrawer({ open: true, editing: uom })}
                          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(uom.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-zinc-400">
                    No units found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <UOMDrawer
          initial={drawer.editing}
          baseUnits={baseUnits}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
