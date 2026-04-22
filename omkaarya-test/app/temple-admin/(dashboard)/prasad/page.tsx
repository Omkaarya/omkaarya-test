"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";

// ── Types ──────────────────────────────────────────────────────────

interface PrasadItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  currency: string;
  includedItems: string[];
  status: "available" | "unavailable";
  updated: string;
  emoji: string;
}

// ── Mock Data ──────────────────────────────────────────────────────

const PRASAD_DATA: PrasadItem[] = [
  {
    id: 1,
    name: "Sakkarai Pongal",
    sku: "PR-001",
    category: "Sweet Prashadham",
    price: 8.0,
    currency: "CHF",
    emoji: "🍮",
    includedItems: ["Rice 1kg", "Jaggery 500g", "Ghee 200ml"],
    status: "available",
    updated: "Oct 12, 2024",
  },
  {
    id: 2,
    name: "Besan Ladoo",
    sku: "PR-002",
    category: "Sweet Prashadham",
    price: 3.5,
    currency: "CHF",
    emoji: "🟠",
    includedItems: ["Besan 500g", "Sugar 300g"],
    status: "available",
    updated: "Oct 10, 2024",
  },
  {
    id: 3,
    name: "Panchamrit",
    sku: "PR-003",
    category: "Liquid",
    price: 5.5,
    currency: "CHF",
    emoji: "🥛",
    includedItems: ["Milk", "Curd", "Honey", "Ghee", "Sugar"],
    status: "available",
    updated: "Oct 09, 2024",
  },
  {
    id: 4,
    name: "Payasam",
    sku: "PR-004",
    category: "Sweet Prashadham",
    price: 6.0,
    currency: "CHF",
    emoji: "🍯",
    includedItems: ["Rice 500g", "Milk 1L", "Sugar 400g"],
    status: "available",
    updated: "Oct 07, 2024",
  },
  {
    id: 5,
    name: "Sundal",
    sku: "PR-005",
    category: "Savoury",
    price: 4.0,
    currency: "CHF",
    emoji: "🫘",
    includedItems: ["Chickpeas 500g", "Coconut 100g"],
    status: "unavailable",
    updated: "Oct 01, 2024",
  },
];

const CATEGORIES = ["All Categories", "Sweet Prashadham", "Savoury", "Liquid", "Fruit & Nut"];

// ── Components ─────────────────────────────────────────────────────

export default function PrasadItemsPage() {
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = PRASAD_DATA.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prashadham Items</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage prashadham with prices, ingredients and pooja mappings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setActiveModal(true)}>
            <Plus className="h-4 w-4" /> Add Prashadham
          </Button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search prashadham..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950">
            {CATEGORIES.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select className="h-10 rounded-xl border border-zinc-100 bg-white px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950">
            <option>All Status</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Prashadham</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Inventory Items</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl dark:bg-zinc-900">
                        {item.emoji}
                      </div>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)] font-mono uppercase">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{item.currency} {item.price.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {item.includedItems.map((inc, i) => (
                        <span key={i} className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-primary)] dark:bg-orange-950/20">
                          {inc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${item.status === "available" ? "text-green-600" : "text-red-500"
                      }`}>
                      {item.status === "available" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {item.status.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {item.updated}
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-50 bg-zinc-50/30 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 text-sm">
          <p className="text-[var(--text-muted)]">
            Showing Results: <span className="font-bold text-[var(--text-primary)]">10</span> per page
          </p>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white dark:bg-zinc-800">1</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">2</button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] text-[var(--text-muted)] py-4">
        2024–2026 © Om Kaaryaa All Rights Reserved • Powered By Pepulux
      </footer>

      {/* Add Prasad Modal */}
      {activeModal && <AddPrasadModal onClose={() => setActiveModal(false)} />}
    </div>
  );
}

// ── Modal Component ─────────────────────────────────────────────────

function AddPrasadModal({ onClose }: { onClose: () => void }) {
  const [ingredients, setIngredients] = useState([{ id: 1, itemId: "", qty: "" }]);

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now(), itemId: "", qty: "" }]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Add New Prashadham</h2>
            <p className="text-xs text-[var(--text-muted)]">Create a prashadham item with price and ingredient mapping</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="flex gap-6 mb-8">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
              <ImageIcon className="h-8 w-8" />
              <span className="text-[10px] font-bold">Upload image</span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prashadham Name *</label>
                  <input type="text" placeholder="e.g. Sakkarai Pongal" className="h-11 w-full rounded-xl border border-zinc-100 px-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category *</label>
                  <select className="h-11 w-full rounded-xl border border-zinc-100 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900">
                    <option>Select category</option>
                    <option>Sweet Prashadham</option>
                    <option>Savoury</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <input type="number" placeholder="0.00" className="h-11 w-full rounded-xl border border-zinc-100 pl-8 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Currency</label>
                  <select className="h-11 w-full rounded-xl border border-zinc-100 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900">
                    <option>CHF</option>
                    <option>USD</option>
                    <option>LKR</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Unit</label>
                  <select className="h-11 w-full rounded-xl border border-zinc-100 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900">
                    <option>Per kg</option>
                    <option>Per piece</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mb-8">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
            <textarea rows={3} placeholder="Short description of this prashadham..." className="w-full rounded-xl border border-zinc-100 p-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900" />
          </div>

          <div className="space-y-4 rounded-3xl bg-zinc-50 p-6 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Included Items / Ingredients</h3>
                <p className="text-[10px] text-[var(--text-muted)] max-w-sm">
                  Map inventory items that go into this prashadham (e.g. Rice 1kg + Ghee 200ml)
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={addIngredient}>
                <Plus className="h-4 w-4" /> Add ingredient
              </Button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex gap-3">
                  <div className="flex-1">
                    <select className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950">
                      <option>Select item from inventory...</option>
                      <option>Rice (PRD-004)</option>
                      <option>Jaggery (PRD-008)</option>
                      <option>Ghee (OIL-002)</option>
                    </select>
                  </div>
                  <div className="w-32">
                    <input type="text" placeholder="Qty" className="h-11 w-full rounded-xl border border-zinc-100 bg-white px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                  </div>
                  <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-100 hover:bg-red-50 hover:text-red-500 dark:border-zinc-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6 font-bold border-zinc-100 dark:border-zinc-800">Cancel</Button>
          <Button onClick={onClose} className="rounded-xl px-8 font-bold">Save Prashadham</Button>
        </div>
      </div>
    </div>
  );
}
