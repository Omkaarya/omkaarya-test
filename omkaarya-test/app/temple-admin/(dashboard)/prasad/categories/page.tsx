"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────

interface CategoryItem {
  id: number;
  name: string;
  description: string;
  itemsCount: number;
  status: "active" | "inactive";
  created: string;
}

// ── Mock Data ──────────────────────────────────────────────────────

const CATS_DATA: CategoryItem[] = [
  {
    id: 1,
    name: "Sweet Prashadham",
    description: "Cooked sweet items like ladoo, pongal, payasam",
    itemsCount: 8,
    status: "active",
    created: "Jan 15, 2026",
  },
  {
    id: 2,
    name: "Savoury Prashadham",
    description: "Savoury items like sundal, mixture",
    itemsCount: 4,
    status: "active",
    created: "Jan 15, 2026",
  },
  {
    id: 3,
    name: "Liquid Prashadham",
    description: "Panchamrit, rose milk, panakam",
    itemsCount: 3,
    status: "active",
    created: "Jan 16, 2026",
  },
  {
    id: 4,
    name: "Fruit & Nut",
    description: "Fresh fruits and dry fruits",
    itemsCount: 6,
    status: "active",
    created: "Jan 18, 2026",
  },
];

// ── Components ─────────────────────────────────────────────────────

export default function PrasadCategoriesPage() {
  const [activeModal, setActiveModal] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prashadham Categories</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage categories for better organization and filtering of offerings
          </p>
        </div>
        <Button className="gap-2" onClick={() => setActiveModal(true)}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Total Items</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Created Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {CATS_DATA.map((cat) => (
                <tr key={cat.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--text-primary)]">{cat.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[var(--text-muted)] max-w-xs truncate">{cat.description}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-xs font-bold dark:bg-zinc-900">
                      {cat.itemsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                      cat.status === "active" ? "text-green-600" : "text-zinc-400"
                    }`}>
                      {cat.status === "active" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {cat.status.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {cat.created}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-[var(--text-muted)] py-4">
        2024–2026 © Om Kaaryaa All Rights Reserved • Powered By Pepulux
      </footer>

      {/* Add Category Modal */}
      {activeModal && <AddCategoryModal onClose={() => setActiveModal(false)} />}
    </div>
  );
}

// ── Modal Component ─────────────────────────────────────────────────

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Add Prashadham Category</h2>
            <p className="text-xs text-[var(--text-muted)]">Create a new category for organisation and filtering</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category Name *</label>
            <input type="text" placeholder="e.g. Sweet Prashadham" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
            <textarea rows={3} placeholder="Describe what items go into this category..." className="w-full rounded-xl border border-zinc-100 p-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
            <div className="text-sm font-bold">Active</div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--brand-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-zinc-700"></div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
          <Button onClick={onClose} className="rounded-xl px-8 font-bold">Add Category</Button>
        </div>
      </div>
    </div>
  );
}
