"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, MoreVertical, Plus } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

type LowStockRow = {
  id: string;
  name: string;
  category: string;
  uom: string;
  qty: number;
  reorderLevel: number;
  status: "Active" | "Inactive";
};

export default function LowStockPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const products = useMemo<LowStockRow[]>(
    () => [
      { id: "1", name: "Cotton wick", category: "Pooja items", uom: "Pack", qty: 9, reorderLevel: 20, status: "Active" },
      { id: "2", name: "Brass diya", category: "Utensils", uom: "Each", qty: 6, reorderLevel: 10, status: "Inactive" },
      { id: "3", name: "Coconut", category: "Offerings", uom: "Each", qty: 15, reorderLevel: 40, status: "Active" },
      { id: "4", name: "Kumkum", category: "Pooja items", uom: "Pack", qty: 5, reorderLevel: 15, status: "Active" },
      { id: "5", name: "Agarbatti (sandal)", category: "Pooja items", uom: "Box", qty: 18, reorderLevel: 25, status: "Active" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = searchInput.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const columns = useMemo<ColumnDef<LowStockRow>[]>(
    () => [
      {
        key: "name",
        header: "Product Name",
        sortable: true,
        cell: (row) => <span className="font-semibold text-text-primary">{row.name}</span>,
      },
      { key: "category", header: "Category" },
      { key: "uom", header: "UOM" },
      {
        key: "qty",
        header: "Quantity",
        align: "right",
        cell: (row) => (
          <span className="font-bold text-status-danger-text tabular-nums">{row.qty}</span>
        ),
      },
      {
        key: "reorderLevel",
        header: "Reorder Level",
        align: "right",
        cell: (row) => <span className="tabular-nums text-text-tertiary">{row.reorderLevel}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge color="error" size="sm">
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Inventory - Low Stocks list
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Monitor and manage products that are below reorder levels.
          </p>
        </div>
        <Button
          variant="destructive"
          leadingIcon={<Plus className="h-4 w-4" />}
        >
          Create Order
        </Button>
      </div>

      {/* Alert Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-border-error/30 bg-status-danger-bg p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-100 text-fg-error">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-status-danger-text">Low Stock items</p>
          <p className="text-display-xs font-bold tracking-tight text-text-primary">
            {String(products.length).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-xs">
        <div className="border-b border-border p-6">
          <div className="w-full max-w-md">
            <SearchInput
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              onClear={searchInput ? () => setSearchInput("") : undefined}
              placeholder="Search low stock items..."
            />
          </div>
        </div>

        <DataTable<LowStockRow>
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.id}
        />

        <div className="px-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
