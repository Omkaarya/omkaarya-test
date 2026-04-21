"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MoreVertical,
  Plus,
  QrCode,
  XCircle,
} from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { MetricCard } from "@/app/components/ds/molecules/MetricCard";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

// ── Types ──────────────────────────────────────────────────────────

type ProductStatus = "Active" | "Inactive";

type InventoryProductRow = {
  id: string;
  name: string;
  category: string;
  uom: string;
  sku: string;
  priceUsd: number;
  qtyInStock: number;
  reorderLevel: number;
  isSellable: boolean;
  createdBy: string;
  createdOn: string;
  lastUpdatedOn: string;
  status: ProductStatus;
  suppliers: string;
};

// ── Filter Tabs ────────────────────────────────────────────────────

const FILTERS = ["All", "Active", "Inactive", "Low stock", "Non-sellable"] as const;
type FilterId = (typeof FILTERS)[number];

// ── Page ───────────────────────────────────────────────────────────

export default function InventoryProductsListPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<FilterId>("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ── Mock Data ────────────────────────────────────────────────────

  const rowsAll = useMemo<InventoryProductRow[]>(
    () => [
      { id: "1", name: "Camphor (tablet)", category: "Pooja items", uom: "Pack", sku: "CMP-001", priceUsd: 2.5, qtyInStock: 120, reorderLevel: 30, isSellable: true, createdBy: "Admin", createdOn: "2026-03-01", lastUpdatedOn: "2026-04-12", status: "Active", suppliers: "Sri Traders" },
      { id: "2", name: "Agarbatti (sandal)", category: "Pooja items", uom: "Box", sku: "AGR-011", priceUsd: 1.75, qtyInStock: 18, reorderLevel: 25, isSellable: true, createdBy: "Admin", createdOn: "2026-03-02", lastUpdatedOn: "2026-04-10", status: "Active", suppliers: "Om Suppliers" },
      { id: "3", name: "Cotton wick", category: "Pooja items", uom: "Pack", sku: "CTW-032", priceUsd: 0.95, qtyInStock: 9, reorderLevel: 20, isSellable: true, createdBy: "Ops", createdOn: "2026-03-05", lastUpdatedOn: "2026-04-08", status: "Active", suppliers: "Sri Traders" },
      { id: "4", name: "Brass diya", category: "Utensils", uom: "Each", sku: "BRS-204", priceUsd: 12.0, qtyInStock: 6, reorderLevel: 10, isSellable: false, createdBy: "Admin", createdOn: "2026-02-27", lastUpdatedOn: "2026-04-02", status: "Inactive", suppliers: "Craft House" },
      { id: "5", name: "Ghee (1L)", category: "Kitchen", uom: "Bottle", sku: "GHE-101", priceUsd: 8.25, qtyInStock: 44, reorderLevel: 15, isSellable: true, createdBy: "Ops", createdOn: "2026-03-12", lastUpdatedOn: "2026-04-15", status: "Active", suppliers: "Milk Co." },
      { id: "6", name: "Coconut", category: "Offerings", uom: "Each", sku: "COC-010", priceUsd: 0.8, qtyInStock: 15, reorderLevel: 40, isSellable: true, createdBy: "Ops", createdOn: "2026-03-20", lastUpdatedOn: "2026-04-18", status: "Active", suppliers: "Local Farm" },
      { id: "7", name: "Ladoo prasad box", category: "Prashadham", uom: "Box", sku: "PRS-055", priceUsd: 4.2, qtyInStock: 80, reorderLevel: 20, isSellable: true, createdBy: "Admin", createdOn: "2026-03-21", lastUpdatedOn: "2026-04-14", status: "Active", suppliers: "Sweet Mart" },
      { id: "8", name: "Kumkum", category: "Pooja items", uom: "Pack", sku: "KUM-006", priceUsd: 0.6, qtyInStock: 5, reorderLevel: 15, isSellable: true, createdBy: "Ops", createdOn: "2026-03-25", lastUpdatedOn: "2026-04-11", status: "Active", suppliers: "Om Suppliers" },
      { id: "9", name: "Vibhuti", category: "Pooja items", uom: "Pack", sku: "VIB-009", priceUsd: 0.55, qtyInStock: 22, reorderLevel: 20, isSellable: true, createdBy: "Admin", createdOn: "2026-03-26", lastUpdatedOn: "2026-04-09", status: "Active", suppliers: "Sri Traders" },
      { id: "10", name: "Incense holder", category: "Utensils", uom: "Each", sku: "INS-220", priceUsd: 3.9, qtyInStock: 12, reorderLevel: 10, isSellable: false, createdBy: "Ops", createdOn: "2026-03-28", lastUpdatedOn: "2026-04-05", status: "Inactive", suppliers: "Craft House" },
    ],
    []
  );

  // ── Filtering ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    let list = rowsAll;
    if (q) {
      list = list.filter((r) => {
        const hay = `${r.name} ${r.category} ${r.sku} ${r.suppliers}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (filter === "Active") list = list.filter((r) => r.status === "Active");
    if (filter === "Inactive") list = list.filter((r) => r.status === "Inactive");
    if (filter === "Low stock") list = list.filter((r) => r.qtyInStock <= r.reorderLevel);
    if (filter === "Non-sellable") list = list.filter((r) => !r.isSellable);
    return list;
  }, [rowsAll, searchInput, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const startIdx = (pageSafe - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  // ── Metrics ──────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const totalProducts = rowsAll.length;
    const lowStock = rowsAll.filter((r) => r.qtyInStock <= r.reorderLevel).length;
    const inventoryValue = rowsAll.reduce((sum, r) => sum + r.priceUsd * r.qtyInStock, 0);
    const categories = new Set(rowsAll.map((r) => r.category)).size;
    return { totalProducts, lowStock, inventoryValue, categories };
  }, [rowsAll]);

  // ── DataTable Columns (using DS ColumnDef) ──────────────────────

  const columns = useMemo<ColumnDef<InventoryProductRow>[]>(
    () => [
      {
        key: "name",
        header: "Product Name",
        sortable: true,
        cell: (row) => (
          <span className="font-semibold text-text-primary">{row.name}</span>
        ),
      },
      { key: "category", header: "Category" },
      { key: "uom", header: "UOM" },
      {
        key: "sku",
        header: "SKU",
        cell: (row) => (
          <span className="font-mono text-xs text-text-tertiary">{row.sku}</span>
        ),
      },
      {
        key: "priceUsd",
        header: "Price(USD)",
        align: "right",
        cell: (row) => (
          <span className="tabular-nums">${row.priceUsd.toFixed(2)}</span>
        ),
      },
      {
        key: "qtyInStock",
        header: "Qty in stock",
        align: "right",
        cell: (row) => <span className="tabular-nums">{row.qtyInStock}</span>,
      },
      {
        key: "reorderLevel",
        header: "Reorder Level",
        align: "right",
        cell: (row) => (
          <span className="tabular-nums text-text-tertiary">{row.reorderLevel}</span>
        ),
      },
      {
        key: "isSellable",
        header: "Is Sellable?",
        cell: (row) => (
          <Badge color={row.isSellable ? "success" : "error"} size="sm">
            {row.isSellable ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Yes
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> No
              </span>
            )}
          </Badge>
        ),
      },
      { key: "createdBy", header: "Created By" },
      { key: "createdOn", header: "Created On" },
      { key: "lastUpdatedOn", header: "Last Updated On" },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge color={row.status === "Active" ? "success" : "gray"} size="sm">
            {row.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        cell: () => (
          <button className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        ),
      },
    ],
    []
  );

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Products Lists
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Manage your products from one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leadingIcon={<QrCode className="h-4 w-4" />}
          >
            Print QR Codes
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push("/temple-admin/inventory/create")}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Grid — using DS MetricCard */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={String(metrics.totalProducts).padStart(2, "0")}
          chartColor="gray"
          showMenu={false}
        />
        <MetricCard
          title="Low Stock Items"
          value={String(metrics.lowStock).padStart(2, "0")}
          chartColor="warning"
          showMenu={false}
        />
        <MetricCard
          title="Total Inventory Value"
          value={`$${metrics.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          chartColor="success"
          showMenu={false}
        />
        <MetricCard
          title="Category"
          value={String(metrics.categories)}
          chartColor="brand"
          showMenu={false}
        />
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-border shadow-xs">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 border-b border-border p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              onClear={searchInput ? () => { setSearchInput(""); setPage(1); } : undefined}
              placeholder="Search products..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text-tertiary">Filter:</span>
            <div className="flex flex-wrap gap-1 rounded-lg bg-subtle p-1">
              {FILTERS.map((id) => {
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setFilter(id); setPage(1); }}
                    className={[
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-surface text-text-primary shadow-xs border border-border/50"
                        : "text-text-secondary hover:text-text-primary",
                    ].join(" ")}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* DS DataTable */}
        <DataTable<InventoryProductRow>
          columns={columns}
          data={pageRows}
          keyExtractor={(row) => row.id}
        />

        {/* DS Pagination */}
        <div className="px-6">
          <Pagination
            currentPage={pageSafe}
            totalPages={totalPages}
            onPageChange={setPage}
            showResultsCount
          />
        </div>
      </div>
    </div>
  );
}
