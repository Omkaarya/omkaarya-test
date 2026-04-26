"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  X,
  ArrowRight,
} from "lucide-react";

// ─── Omkaarya Design System ───────────────────────────────────────
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { Input } from "@/app/components/ds/atoms/Input";
import { Select } from "@/app/components/ds/atoms/Select";
import { Label } from "@/app/components/ds/atoms/Label";
import { DataTable, ColumnDef } from "@/app/components/ds/organisms/DataTable";
import { AvatarCell, TextCell } from "@/app/components/ds/molecules/TableCells";

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

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Sweet Prashadham", value: "sweet" },
  { label: "Savoury", value: "savoury" },
  { label: "Liquid", value: "liquid" },
];

export default function PrasadItemsPage() {
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = PRASAD_DATA.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<PrasadItem>[] = [
    {
      key: "name",
      header: "Prashadham",
      cell: (item) => (
        <AvatarCell 
          title={item.name} 
          subtitle={item.sku} 
          initials={item.emoji} 
        />
      )
    },
    {
      key: "category",
      header: "Category",
      cell: (item) => <TextCell text={item.category} />
    },
    {
      key: "price",
      header: "Price",
      cell: (item) => (
        <div className="font-bold text-sm text-text-primary">
          {item.currency} {item.price.toFixed(2)}
        </div>
      )
    },
    {
      key: "includedItems",
      header: "Ingredients",
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {item.includedItems.map((inc, i) => (
            <Badge key={i} size="sm" color="brand" variant="subtle" className="text-[9px] px-1.5">
              {inc}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge 
          color={item.status === "available" ? "success" : "error"} 
          size="sm"
          leadingIcon={item.status === "available" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        >
          {item.status.toUpperCase()}
        </Badge>
      )
    },
    {
      key: "updated",
      header: "Last Updated",
      cell: (item) => <TextCell text={item.updated} />
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: () => (
        <Button variant="ghost" size="sm" iconOnly>
          <MoreVertical className="w-4 h-4 text-text-tertiary" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-display-xs font-bold text-text-primary tracking-tight">
            Prashadham Items
          </h1>
          <p className="text-sm font-medium text-text-tertiary mt-1">
            Manage prashadham with prices, ingredients and pooja mappings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" leadingIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
          <Button size="md" leadingIcon={<Plus className="h-4 w-4" />} onClick={() => setActiveModal(true)}>
            Add Prashadham
          </Button>
        </div>
      </div>

      {/* ─── Filters & Table ────────────────────────────────────────── */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div className="w-full sm:w-80">
              <Input 
                placeholder="Search items..." 
                leadingIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <Select options={CATEGORIES} defaultValue="all" />
              </div>
              <Button variant="outline" iconOnly><Filter className="w-4 h-4" /></Button>
           </div>
        </div>

        <DataTable 
          columns={columns}
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          className="border-0"
        />

        <div className="px-6 py-4 border-t border-border bg-subtle/30 flex items-center justify-between">
           <p className="text-xs font-medium text-text-tertiary">
             Showing <span className="text-text-primary">{filteredItems.length}</span> results
           </p>
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 px-2">Previous</Button>
              <Button variant="outline" size="sm" className="h-8 px-2 bg-brand text-white border-brand">1</Button>
              <Button variant="outline" size="sm" className="h-8 px-2">Next</Button>
           </div>
        </div>
      </div>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="text-center text-[10px] text-text-disabled py-4 uppercase tracking-widest font-bold">
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-surface shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Add New Prashadham</h2>
            <p className="text-xs font-medium text-text-tertiary">Create a prashadham item with price and ingredient mapping</p>
          </div>
          <Button variant="ghost" iconOnly onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
          <div className="flex gap-6">
            <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-subtle text-text-tertiary hover:border-brand hover:text-brand transition-colors cursor-pointer">
              <ImageIcon className="h-6 w-6" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Upload image</span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
               <div className="col-span-2 space-y-1.5">
                 <Label>Prashadham Name</Label>
                 <Input placeholder="e.g. Sakkarai Pongal" />
               </div>
               <div className="space-y-1.5">
                 <Label>Category</Label>
                 <Select options={CATEGORIES} />
               </div>
               <div className="space-y-1.5">
                 <Label>Price (LKR)</Label>
                 <Input type="number" placeholder="0.00" />
               </div>
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-subtle border border-border">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Ingredients / Items</h4>
                <Button size="sm" variant="outline" leadingIcon={<Plus className="w-3 h-3" />} onClick={() => setIngredients([...ingredients, { id: Date.now(), itemId: "", qty: "" }])}>
                  Add Item
                </Button>
             </div>
             <div className="space-y-3">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex gap-3">
                    <div className="flex-1">
                      <Select options={[{ label: "Rice (PRD-004)", value: "1" }]} placeholder="Select inventory item..." />
                    </div>
                    <div className="w-24">
                      <Input placeholder="Qty" />
                    </div>
                    <Button variant="ghost" iconOnly className="text-error"><X className="w-4 h-4" /></Button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-subtle/50 flex justify-end gap-3">
           <Button variant="outline" size="md" className="px-6" onClick={onClose}>Cancel</Button>
           <Button size="md" className="px-8" onClick={onClose}>Save Product</Button>
        </div>
      </div>
    </div>
  );
}
