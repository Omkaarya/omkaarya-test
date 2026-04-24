"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import StatusBadge from "@/app/components/admin/StatusBadge";
import AdminDataTable from "@/app/components/admin/AdminDataTable";

type Deity = {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  image: string | null;
};

// ── Mock Data ──────────────────────────────────────────────────────

const INITIAL_DEITIES: Deity[] = [
  { id: "0001", name: "Pillayar", status: "Active", image: null },
  { id: "0002", name: "Murugan", status: "Active", image: null },
  { id: "0003", name: "Shiva (Sivan)", status: "Active", image: null },
  { id: "0004", name: "Parvati (Amman)", status: "Active", image: null },
  { id: "0005", name: "Mariamman", status: "Active", image: null },
  { id: "0006", name: "Kali (Kaaliamman)", status: "Active", image: null },
  { id: "0007", name: "Bhadrakali", status: "Inactive", image: null },
  { id: "0008", name: "Krishna", status: "Active", image: null },
  { id: "0009", name: "Vinayagar", status: "Active", image: null },
  { id: "0010", name: "Naga Thambiran", status: "Active", image: null },
];

// ── Page Component ──────────────────────────────────────────────────

export default function DeitiesMasterPage() {
  const [deities, setDeities] = useState(INITIAL_DEITIES);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: "Active" as "Active" | "Inactive",
    image: null as File | null
  });

  const filteredDeities = useMemo(() => {
    return deities.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [deities, search]);

  const handleAddDeity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      const newDeity = {
        id: String(deities.length + 1).padStart(4, '0'),
        name: formData.name,
        status: formData.status,
        image: null
      };
      setDeities([newDeity, ...deities]);
      setIsModalOpen(false);
      setFormData({ name: "", status: "Active", image: null });
      setIsSubmitting(false);
    }, 600);
  };

  const tableHeaders = ["Deity ID", "Image", "Name", "Status", "Actions"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Deities</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-medium">Manage and monitor deities here.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Deity
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium focus:border-[var(--brand-primary)] outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button className="px-4 py-2 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm uppercase tracking-wider">All</button>
          <button className="px-4 py-2 text-[10px] font-bold rounded-lg text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Active</button>
          <button className="px-4 py-2 text-[10px] font-bold rounded-lg text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Inactive</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <AdminDataTable headers={tableHeaders} isEmpty={filteredDeities.length === 0}>
          {filteredDeities.map((deity) => (
            <tr key={deity.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
              <td className="px-6 py-4">
                <span className="text-xs font-bold text-zinc-400 tracking-widest">#{deity.id}</span>
              </td>
              <td className="px-6 py-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  <ImageIcon className="w-5 h-5 text-zinc-300" />
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{deity.name}</span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={deity.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button className="p-2 rounded-lg text-zinc-400 hover:text-[var(--brand-primary)] hover:bg-orange-50 transition-all"><Pencil className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      </div>

      {/* Add Deity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Add New Deity</h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">Create a new deity profile for the master registry.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleAddDeity} className="p-8 space-y-6">

              {/* Image Upload Area */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deity Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 bg-zinc-50/50 hover:bg-white transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200"><span className="text-[var(--brand-primary)]">Click to upload</span> or drag and drop</p>
                  <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase">SVG, PNG, JPG or WEBP (MAX. 800x800px)</p>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Deity Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter deity name..."
                  className="w-full h-12 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold focus:border-[var(--brand-primary)] outline-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Status: {formData.status}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${formData.status === 'Active' ? 'bg-[var(--brand-primary)]' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-bold shadow-xl shadow-orange-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                  Save Deity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
