"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";

import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SearchInput } from "@/app/components/ds/molecules/SearchInput";
import { Pagination } from "@/app/components/ds/molecules/Pagination";
import { DataTable, type ColumnDef } from "@/app/components/ds/organisms/DataTable";

type CategoryRow = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  status: "Active" | "Inactive";
};

export default function CategoriesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const categories = useMemo<CategoryRow[]>(
    () => [
      { id: "CAT-001", name: "Pooja Items", description: "Essential items for daily rituals and poojas.", itemCount: 45, status: "Active" },
      { id: "CAT-002", name: "Offerings", description: "Flowers, fruits, and other items for offerings.", itemCount: 28, status: "Active" },
      { id: "CAT-003", name: "Kitchen", description: "Ingredients and supplies for temple kitchen.", itemCount: 15, status: "Active" },
      { id: "CAT-004", name: "Utensils", description: "Traditional brass and copper vessels.", itemCount: 12, status: "Active" },
      { id: "CAT-005", name: "Prashadham", description: "Boxes and materials for prashad distribution.", itemCount: 8, status: "Active" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = searchInput.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [categories, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        cell: (row) => <span className="font-mono text-xs text-text-tertiary">{row.id}</span>,
      },
      {
        key: "name",
        header: "Category",
        sortable: true,
        cell: (row) => <span className="font-semibold text-text-primary">{row.name}</span>,
      },
      {
        key: "description",
        header: "Description",
        cell: (row) => (
          <span className="text-text-secondary max-w-md truncate block">{row.description}</span>
        ),
      },
      {
        key: "itemCount",
        header: "Products Count",
        align: "right",
        cell: (row) => <span className="tabular-nums">{row.itemCount}</span>,
      },
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-bold tracking-tight text-text-primary">
            Inventory - Category
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Manage your product categories and descriptions.
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus className="h-4 w-4" />}>
          Create Category
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-xs">
        <div className="border-b border-border p-6">
          <div className="w-full max-w-md">
            <SearchInput
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              onClear={searchInput ? () => setSearchInput("") : undefined}
              placeholder="Search categories..."
            />
          </div>
        </div>

        <DataTable<CategoryRow>
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
