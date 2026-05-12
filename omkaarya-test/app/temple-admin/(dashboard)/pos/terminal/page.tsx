"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart, Plus, Minus, Trash2, LayoutGrid, Box, Utensils, Heart, UserPlus,
  History, LayoutDashboard, Pause, CreditCard, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Select } from "@/app/components/ds/atoms/Select";
import { Badge } from "@/app/components/ds/atoms/Badge";

import { fetchTempleAdminJson, type Devotee } from "@/lib/temple-admin-api";
import type { TempleInventoryProduct } from "@/lib/temple-inventory-api";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const CATEGORIES_PRESET = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "Prasadam", label: "Prasad", icon: Utensils },
  { id: "Items", label: "Items", icon: Box },
];

export default function PosTerminalPage() {
  return (
    <React.Suspense fallback={<div className="h-full w-full animate-pulse bg-subtle" />}>
      <PosTerminalContent />
    </React.Suspense>
  );
}

function PosTerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const registerId = searchParams.get("register");

  const [products, setProducts] = useState<TempleInventoryProduct[]>([]);
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [devoteeId, setDevoteeId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [prods, devs] = await Promise.all([
          fetchTempleAdminJson<{ products: TempleInventoryProduct[] }>("/api/temple-admin/inventory/products"),
          fetchTempleAdminJson<{ items: Devotee[] }>("/api/temple-admin/devotees"),
        ]);
        if (!cancelled) {
          setProducts(prods.products ?? []);
          setDevotees(devs.items ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const addToCart = (p: TempleInventoryProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, price: Number(p.costAmount) || 0, quantity: 1, unit: p.unit },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );

  const completeOrder = async () => {
    if (cart.length === 0) {
      setError("Add at least one item.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const reference = `POS-${Date.now().toString(36).toUpperCase()}`;
      await fetchTempleAdminJson("/api/temple-admin/pos/orders", {
        method: "POST",
        body: JSON.stringify({
          reference,
          sessionId: sessionId || null,
          registerId: registerId || null,
          devoteeId: devoteeId || null,
          totalAmount: subtotal,
          taxAmount: 0,
          discountAmount: 0,
          paymentMethod,
          paymentStatus: "paid",
          lines: cart.map((i) => ({
            productId: i.productId,
            description: i.name,
            quantity: i.quantity,
            unitAmount: i.price,
            totalAmount: i.price * i.quantity,
          })),
        }),
      });
      setSuccess(`Order ${reference} saved.`);
      setCart([]);
      setDevoteeId("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save order.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeSession = async () => {
    if (!sessionId) {
      router.push("/temple-admin/pos");
      return;
    }
    if (!confirm("Close this POS session?")) return;
    try {
      await fetchTempleAdminJson(`/api/temple-admin/pos/sessions/${sessionId}/close`, {
        method: "POST",
        body: JSON.stringify({ closingAmount: subtotal }),
      });
      router.push("/temple-admin/pos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not close session.");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <div className="flex flex-1 min-h-0 gap-4">
        <div className="flex flex-1 min-w-0 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex w-20 flex-col items-center gap-3 border-r border-border bg-subtle py-4 shrink-0">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-all gap-1 ${
                activeCategory === "all" ? "bg-brand text-white shadow-md" : "text-text-tertiary hover:bg-surface"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-[9px] font-bold text-center leading-tight">All</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-all gap-1 ${
                  activeCategory === cat ? "bg-brand text-white shadow-md" : "text-text-tertiary hover:bg-surface"
                }`}
              >
                <Box className="h-4 w-4" />
                <span className="text-[9px] font-bold text-center leading-tight truncate w-full px-1">{cat}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Terminal Counter</h2>
                <p className="text-xs font-medium text-text-tertiary">
                  {sessionId ? `Session ${sessionId.slice(0, 8)}…` : "No active session"} · {filtered.length} products
                </p>
              </div>
              <Badge variant="brand" size="md" className="font-bold">
                {activeCategory === "all" ? "All products" : activeCategory}
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-text-tertiary">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading products…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-sm text-text-tertiary">No products available.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <div key={p.id} className="bg-surface rounded-xl border border-border p-4 hover:border-brand transition-all flex flex-col gap-3 group">
                    <div className="aspect-[4/3] rounded-lg bg-subtle flex items-center justify-center relative overflow-hidden">
                      <Box className="w-8 h-8 text-border" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-text-primary line-clamp-1">{p.name}</h3>
                      <p className="text-[10px] text-text-tertiary">SKU: {p.sku} · stock {p.quantity} {p.unit}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-md font-bold text-brand">₹{Number(p.costAmount).toFixed(2)}</span>
                        <Button onClick={() => addToCart(p)} size="sm" leadingIcon={<Plus className="w-3 h-3" />} className="h-8 px-3 text-xs">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="w-[380px] bg-surface rounded-2xl border border-border flex flex-col shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Current Order</h3>
              <Badge variant="outline">{cart.length} items</Badge>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={devoteeId}
                  onChange={(e) => setDevoteeId(e.target.value)}
                  placeholder="Walk-in (no devotee)"
                  options={devotees.map((d) => ({ value: d.id, label: d.full_name }))}
                />
              </div>
              <Button iconOnly variant="secondary" className="h-11 w-11" onClick={() => router.push("/temple-admin/peoples/staff/new")}>
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-3">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "upi", label: "UPI" },
                  { value: "online", label: "Online" },
                ]}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-none space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <div className="flex-1">
                  <p className="text-xs font-bold text-text-primary">{item.name}</p>
                  <p className="text-[10px] text-brand font-bold">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-subtle rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 text-text-tertiary hover:text-text-primary">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 text-text-tertiary hover:text-text-primary">
                    <Plus className="w-3 h-3" />
                  </button>
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
              <div className="flex justify-between text-xs font-medium text-text-tertiary">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-md font-bold text-text-primary">
                <span>Total</span>
                <span className="text-brand">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full h-12 font-bold uppercase tracking-widest text-xs"
              onClick={completeOrder}
              disabled={submitting || cart.length === 0}
            >
              {submitting ? "Saving…" : "Complete Order"}
            </Button>
          </div>
        </aside>
      </div>

      <div className="h-16 bg-surface border border-border rounded-2xl flex items-center justify-center gap-3 px-6 shadow-sm overflow-x-auto no-scrollbar">
        <Link href="/temple-admin/pos">
          <Button variant="secondary" size="sm" leadingIcon={<LayoutDashboard className="w-4 h-4" />} className="bg-zinc-100 text-zinc-900 border-0">
            Dashboard
          </Button>
        </Link>
        <Button variant="secondary" size="sm" leadingIcon={<Pause className="w-4 h-4" />} onClick={closeSession}>
          Close session
        </Button>
        <Button variant="secondary" size="sm" leadingIcon={<Trash2 className="w-4 h-4" />} onClick={() => setCart([])}>
          Clear
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<CreditCard className="w-4 h-4" />}
          className="bg-brand text-white hover:bg-brand-hover"
          onClick={completeOrder}
          disabled={submitting || cart.length === 0}
        >
          Payment
        </Button>
        <Link href="/temple-admin/finance/transactions">
          <Button variant="secondary" size="sm" leadingIcon={<History className="w-4 h-4" />}>
            History
          </Button>
        </Link>
      </div>
    </div>
  );
}
