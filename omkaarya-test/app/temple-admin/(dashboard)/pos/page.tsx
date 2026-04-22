"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  MoreVertical,
  Plus,
  Minus,
  Trash2,
  Package,
  History,
  HoldFull,
  CheckCircle2,
  X,
  Printer,
  BarChart3,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  List,
  Cookie,
  Flower2,
  Waves,
  Gift,
  BookOpen,
  Droplets,
  Flame,
  CircleDot,
  Box,
  Utensils
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────

type Category = "prasad" | "flowers" | "oils" | "kits" | "books";

interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  icon: string | React.ElementType; // Using strings for icons from HTML reference
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
}

// ── Mock Data ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "prasad", label: "Prashadham", icon: Cookie },
  { id: "flowers", label: "Flowers", icon: Flower2 },
  { id: "oils", label: "Lamps & Oils", icon: Waves },
  { id: "kits", label: "Pooja Kits", icon: Gift },
  { id: "books", label: "Books", icon: BookOpen },
];

const PRODUCTS: Product[] = [
  { id: 1, name: "Besan Ladoo", category: "prasad", price: 350.0, icon: CircleDot, unit: "pcs" },
  { id: 2, name: "Sakkarai Pongal", category: "prasad", price: 800.0, icon: Utensils, unit: "kg" },
  { id: 3, name: "Payasam", category: "prasad", price: 600.0, icon: Utensils, unit: "bowl" },
  { id: 4, name: "Coconut Ladoo", category: "prasad", price: 400.0, icon: CircleDot, unit: "pcs" },
  { id: 5, name: "Panchamrit", category: "prasad", price: 550.0, icon: Droplets, unit: "litre" },
  { id: 6, name: "Motichoor Ladoo", category: "prasad", price: 300.0, icon: CircleDot, unit: "pcs" },
  { id: 7, name: "Rose Garland", category: "flowers", price: 300.0, icon: Flower2, unit: "garland" },
  { id: 8, name: "Marigold Loose", category: "flowers", price: 500.0, icon: Flower2, unit: "kg" },
  { id: 9, name: "Jasmine", category: "flowers", price: 700.0, icon: Flower2, unit: "kg" },
  { id: 10, name: "Lotus", category: "flowers", price: 250.0, icon: Flower2, unit: "pcs" },
  { id: 11, name: "Sesame Oil", category: "oils", price: 800.0, icon: Droplets, unit: "litre" },
  { id: 12, name: "Camphor", category: "oils", price: 450.0, icon: Flame, unit: "pack" },
  { id: 13, name: "Ghee", category: "oils", price: 1200.0, icon: Flame, unit: "litre" },
  { id: 14, name: "Pooja Kit Basic", category: "kits", price: 2500.0, icon: Box, unit: "kit" },
  { id: 15, name: "Archana Kit", category: "kits", price: 1800.0, icon: Box, unit: "kit" },
  { id: 16, name: "Panchangam 2026", category: "books", price: 800.0, icon: BookOpen, unit: "pcs" },
];

// ── Components ─────────────────────────────────────────────────────

export default function PosPage() {
  const [layout, setLayout] = useState<1 | 2>(1);
  const [activeCategory, setActiveCategory] = useState<Category>("prasad");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Cart Logic
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

  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(
      (p) => p.category === activeCategory && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  // Layout Renders
  const renderLayout1 = () => (
    <div className="flex h-full min-h-0 bg-zinc-50/50 dark:bg-zinc-900/30">
      {/* Left Icon Rail */}
      <div className="flex w-[88px] flex-col items-center gap-4 border-r border-zinc-100 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as Category)}
            title={cat.label}
            className={`flex h-14 w-14 items-center justify-center rounded-[18px] transition-all flex-col gap-1 ${
              activeCategory === cat.id
                ? "bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20"
                : "text-[var(--text-muted)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <cat.icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayout2 = () => (
    <div className="flex flex-col h-full">
      {/* Top Category Row */}
      <div className="flex items-center gap-4 overflow-x-auto border-b border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as Category)}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl border px-6 py-4 transition-all ${
              activeCategory === cat.id
                ? "border-[var(--brand-primary)] bg-orange-50 text-[var(--brand-primary)] dark:bg-orange-950/20"
                : "border-zinc-100 bg-white text-[var(--text-muted)] hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            }`}
          >
            <cat.icon className="h-5 w-5" />
            <span className="text-sm font-bold">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} layout="compact" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-zinc-950">
      {/* POS Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Point of Sale</h1>
          <div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800" />
          <p className="text-xs text-[var(--text-muted)]">
            Wesley Admin • <span className="font-semibold text-[var(--text-primary)]">Today, April 22 2026</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-lg border border-zinc-100 bg-zinc-50 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)] dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setLayout(layout === 1 ? 2 : 1)}>
            Layout {layout === 1 ? "2" : "1"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveModal("orders")}>
            Orders
          </Button>
        </div>
      </header>

      {/* POS Body */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          {layout === 1 ? renderLayout1() : renderLayout2()}
        </div>

        {/* Right Sidebar - Order List */}
        <aside className="flex w-[400px] shrink-0 flex-col border-l border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-[var(--brand-primary)]" />
              <h2 className="text-lg font-bold">Current Order</h2>
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-[11px] font-bold text-white">
                {cart.length}
              </span>
            </div>
            <button
              onClick={clearCart}
              className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Devotee Section */}
          <div className="border-b border-zinc-100 p-6 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex h-12 items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 transition-colors focus-within:border-[var(--brand-primary)]">
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Devotee Name..."
                className="flex-1 bg-transparent text-sm outline-none w-full"
              />
            </div>
            {/* Mock Devotee result */}
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-950/20 dark:bg-orange-950/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">James Anderson</span>
                <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">#2001</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
                <span>+94 76 543 2100</span>
                <span>3 members</span>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-24 text-[var(--text-muted)]">
                <ShoppingCart className="mb-4 h-12 w-12 opacity-10" />
                <p className="text-sm font-bold">No items in cart</p>
                <p className="text-xs mt-1 opacity-70">Add items from the library to checkout.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-[var(--brand-primary)] dark:bg-zinc-900">
                    {React.createElement(item.icon as React.ElementType, { className: "h-5 w-5" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                      LKR {item.price.toFixed(2)} / {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="w-[88px] text-right">
                    <p className="text-sm font-bold">LKR {(item.price * item.quantity).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="space-y-3 border-b border-zinc-100 dark:border-zinc-800 pb-5">
              <div className="flex justify-between text-sm font-bold text-[var(--text-muted)]">
                <span>Subtotal</span>
                <span>LKR {subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text-muted)]">
                <span>Tax (0%)</span>
                <span>LKR 0.00</span>
              </div>
            </div>
            
            <div className="pt-5 flex justify-between items-end">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Amount</span>
              <span className="text-3xl font-black tracking-tight text-[var(--text-primary)]">LKR {subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-[var(--brand-primary)] bg-orange-50 text-sm font-bold text-[var(--brand-primary)] dark:bg-orange-950/20">
                  Cash
                </button>
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-zinc-100 bg-white text-sm font-bold text-[var(--text-muted)] dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                  Card
                </button>
              </div>
            </div>

            <Button
              className="mt-6 h-14 w-full text-base font-bold rounded-2xl"
              disabled={cart.length === 0}
              onClick={() => setActiveModal("payment")}
            >
              Confirm & Place Order
            </Button>
          </div>
        </aside>
      </div>

      {/* POS Bottom Bar (Optional Action Rail like in HTML L2) */}
      {layout === 2 && (
        <div className="flex h-16 shrink-0 items-center gap-2 border-t border-zinc-100 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 overflow-x-auto no-scrollbar">
          <ActionBtn icon={Pause} label="Hold" color="bg-orange-100 text-orange-600 dark:bg-orange-900/20" />
          <ActionBtn icon={X} label="Void" color="bg-red-50 text-red-600 dark:bg-red-900/20" />
          <ActionBtn icon={ShoppingCart} label="Order" color="bg-blue-50 text-blue-600 dark:bg-blue-900/20" />
          <ActionBtn icon={Package} label="Products" color="bg-purple-50 text-purple-600 dark:bg-purple-900/20" />
          <ActionBtn icon={History} label="Transactions" color="bg-teal-50 text-teal-600 dark:bg-teal-900/20" />
          <ActionBtn icon={Maximize2} label="Fullscreen" color="bg-zinc-50 text-zinc-600 dark:bg-zinc-800" />
        </div>
      )}

      {/* Modals placeholders */}
      {activeModal === "payment" && <PaymentModal onClose={() => setActiveModal(null)} amount={subtotal} />}
      {activeModal === "orders" && <OrdersModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function ProductCard({
  product,
  onAdd,
  layout = "default",
}: {
  product: Product;
  onAdd: () => void;
  layout?: "default" | "compact";
}) {
  return (
    <div
      onClick={onAdd}
      className={`group relative flex cursor-pointer flex-col overflow-hidden transition-all hover:border-[var(--brand-primary)] hover:shadow-xl hover:shadow-orange-500/5 ${
        layout === "compact"
          ? "rounded-2xl border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          : "rounded-[24px] border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <div className={`flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)] group-hover:bg-orange-50 group-hover:text-[var(--brand-primary)] transition-colors ${layout === "compact" ? "h-24" : "h-36"}`}>
        {React.createElement(product.icon as React.ElementType, { className: layout === "compact" ? "h-8 w-8" : "h-12 w-12" })}
      </div>
      <div className="p-5">
        <h3 className="truncate text-sm font-bold leading-tight text-[var(--text-primary)]">{product.name}</h3>
        <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">
          LKR {product.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <span className="font-medium opacity-70">/ {product.unit}</span>
        </p>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-xs font-bold text-[var(--text-primary)] transition-all group-hover:bg-[var(--brand-primary)] group-hover:text-white dark:bg-zinc-800">
          <Plus className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className={`flex min-w-[100px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:opacity-80 ${color}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ── Modals (Simplified for now) ──────────────────────────────────────

function PaymentModal({ onClose, amount }: { onClose: () => void; amount: number }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-950/20">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Payment Success</h2>
        <p className="mt-3 text-sm font-medium text-[var(--text-muted)] lg:px-6 leading-relaxed">
          The order has been placed successfully for <br/><b className="text-lg text-[var(--text-primary)] mt-1 inline-block">LKR {amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Button onClick={onClose} className="h-14 w-full rounded-2xl font-bold text-base">
            Print Full Receipt
          </Button>
          <Button variant="outline" onClick={onClose} className="h-14 w-full rounded-2xl font-bold border-zinc-200 dark:border-zinc-800">
            Start New Order
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrdersModal({ onClose }: { onClose: () => void }) {
  const mockOrders = [
    { id: "ORD-001", devotee: "Jerry Flanders", items: 3, total: "LKR 24.50", status: "active", date: "Today 09:14" },
    { id: "ORD-002", devotee: "Rajan Kumar", items: 1, total: "LKR 8.00", status: "hold", date: "Today 08:30" },
    { id: "ORD-003", devotee: "James Anderson", items: 5, total: "LKR 47.00", status: "paid", date: "Yesterday" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl dark:bg-zinc-950 overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-zinc-100 p-8 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Orders log</h2>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">Manage and review all temple orders for today</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">
          <div className="mb-6 flex gap-3">
            <Button size="sm" className="rounded-full px-5 py-4 h-auto text-xs">Active Orders</Button>
            <Button variant="outline" size="sm" className="rounded-full px-5 py-4 h-auto text-xs border-zinc-200 dark:border-zinc-800">On Hold</Button>
            <Button variant="outline" size="sm" className="rounded-full px-5 py-4 h-auto text-xs border-zinc-200 dark:border-zinc-800">Completed</Button>
          </div>
          <div className="space-y-4">
            {mockOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-2xl border-2 border-zinc-100 p-5 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[var(--text-primary)]">{o.devotee}</span>
                    <span className={`rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                      o.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:border-green-900/50' : 
                      o.status === 'hold' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">{o.id} <span className="mx-1">•</span> {o.date}</p>
                </div>
                <div className="text-right flex items-center gap-8">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{o.items} items</p>
                    <p className="text-lg font-black text-[var(--text-primary)]">{o.total}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-5 rounded-xl border-zinc-200 dark:border-zinc-800">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Icons needed for bottom bar ─────────────────────────────────────
const Pause = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
