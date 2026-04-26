"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  X,
  LayoutGrid,
  Flower2,
  Box,
  Utensils,
  Heart,
  UserPlus,
  Maximize,
  RotateCcw,
  History,
  LayoutDashboard,
  Pause,
  CreditCard,
  Banknote,
  MoreHorizontal
} from "lucide-react";

// ─── Omkaarya Design System ───────────────────────────────────────
import { Button } from "@/app/components/ds/atoms/Button";
import { Input } from "@/app/components/ds/atoms/Input";
import { Select } from "@/app/components/ds/atoms/Select";
import { Label } from "@/app/components/ds/atoms/Label";
import { Badge } from "@/app/components/ds/atoms/Badge";

// ─── Types ──────────────────────────────────────────────────────────
type Category = "all" | "archchanai" | "items" | "prasad" | "seva";

interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "archchanai", label: "Tickets", icon: History },
  { id: "items", label: "Items", icon: Box },
  { id: "prasad", label: "Prasadham", icon: Utensils },
  { id: "seva", label: "Seva", icon: Flower2 },
];

const PRODUCTS: Product[] = [
  { id: 1, name: "Normal Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
  { id: 2, name: "Kunguma Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
  { id: 3, name: "Kalanji Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
  { id: 4, name: "Sahasranama Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
  { id: 5, name: "Motcha Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
  { id: 6, name: "All Deity Archchanai", category: "archchanai", price: 400.0, unit: "pcs" },
];

export default function PosTerminalPage() {
  return (
    <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-subtle" />}>
      <PosTerminalContent />
    </React.Suspense>
  );
}

function PosTerminalContent() {
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<1 | 2>(1);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const l = searchParams.get("layout");
    if (l === "2") setLayout(2);
    else setLayout(1);
  }, [searchParams]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500">
      
      <div className="flex flex-1 min-h-0 gap-4">
        
        {/* Left Section: Product Grid */}
        <div className={`flex flex-1 min-w-0 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden ${layout === 1 ? 'flex-row' : 'flex-col'}`}>
          
          {/* Categories Sidebar (Layout 1) */}
          {layout === 1 && (
            <div className="flex w-20 flex-col items-center gap-3 border-r border-border bg-subtle py-4 shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as Category)}
                  className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-all gap-1 ${activeCategory === cat.id
                    ? "bg-brand text-white shadow-md"
                    : "text-text-tertiary hover:bg-surface"
                    }`}
                >
                  <cat.icon className="h-4 w-4" />
                  <span className="text-[9px] font-bold text-center leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Terminal Counter</h2>
                <p className="text-xs font-medium text-text-tertiary">Wesley Adrian • Dec 24, 2025</p>
              </div>
              <Badge variant="brand" size="md" className="font-bold">Featured Seva</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="bg-surface rounded-xl border border-border p-4 hover:border-brand transition-all flex flex-col gap-3 group">
                   <div className="aspect-[4/3] rounded-lg bg-subtle flex items-center justify-center relative overflow-hidden">
                      <Button variant="ghost" size="sm" iconOnly className="absolute top-2 right-2 text-text-tertiary group-hover:text-red-500">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Box className="w-8 h-8 text-border" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-sm font-bold text-text-primary line-clamp-1">{p.name}</h3>
                      <div className="flex items-center justify-between">
                         <span className="text-md font-bold text-brand">${p.price}</span>
                         <Button onClick={() => addToCart(p)} size="sm" leadingIcon={<Plus className="w-3 h-3" />} className="h-8 px-3 text-xs">Add</Button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Order List */}
        <aside className="w-[380px] bg-surface rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Current Order</h3>
              <Badge variant="outline">ORD-2025</Badge>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Select placeholder="Search Devotee..." options={[]} />
              </div>
              <Button iconOnly variant="secondary" className="h-11 w-11"><UserPlus className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-4">
             {cart.map((item, i) => (
               <div key={i} className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-text-primary">{item.name}</p>
                    <p className="text-[10px] text-brand font-bold">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-subtle rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-text-tertiary hover:text-text-primary"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-text-tertiary hover:text-text-primary"><Plus className="w-3 h-3" /></button>
                  </div>
               </div>
             ))}
             {cart.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-text-tertiary gap-2 opacity-50 py-10">
                 <ShoppingCart className="w-8 h-8" />
                 <p className="text-xs font-bold">Cart is empty</p>
               </div>
             )}
          </div>

          <div className="p-5 bg-subtle border-t border-border space-y-4">
             <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-text-tertiary"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-md font-bold text-text-primary"><span>Total</span><span className="text-brand">${subtotal}</span></div>
             </div>
             <Button className="w-full h-12 font-bold uppercase tracking-widest text-xs" onClick={() => alert('Order Placed!')}>
               Complete Order
             </Button>
          </div>
        </aside>
      </div>

      {/* Action Rail */}
      <div className="h-16 bg-surface border border-border rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm overflow-x-auto no-scrollbar">
         <Link href="/temple-admin/pos">
            <Button variant="secondary" size="sm" leadingIcon={<LayoutDashboard className="w-4 h-4" />} className="bg-zinc-100 text-zinc-900 border-0">Dashboard</Button>
         </Link>
         <Button variant="secondary" size="sm" leadingIcon={<Pause className="w-4 h-4" />}>Hold</Button>
         <Button variant="secondary" size="sm" leadingIcon={<Trash2 className="w-4 h-4" />}>Void</Button>
         <Button variant="secondary" size="sm" leadingIcon={<CreditCard className="w-4 h-4" />} className="bg-brand text-white hover:bg-brand-hover">Payment</Button>
         <Button variant="secondary" size="sm" leadingIcon={<History className="w-4 h-4" />}>History</Button>
         <Button variant="secondary" size="sm" leadingIcon={<RotateCcw className="w-4 h-4" />}>Reset</Button>
      </div>
    </div>
  );
}
