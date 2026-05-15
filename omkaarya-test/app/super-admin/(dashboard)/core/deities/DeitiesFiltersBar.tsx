"use client";

import { Search } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";

export type DeityStatusFilter = "all" | "active" | "inactive";

export type DeitiesSortBy = "name" | "last7";

type DeitiesFiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: DeityStatusFilter;
  onStatusChange: (status: DeityStatusFilter) => void;
  sortBy: DeitiesSortBy;
  onSortByChange: (sortBy: DeitiesSortBy) => void;
};

const statusPills: { key: DeityStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function DeitiesFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
}: DeitiesFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-border p-4 lg:flex-nowrap lg:gap-4">
      <div className="relative min-w-[min(100%,280px)] w-full flex-1 lg:min-w-[320px] lg:max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Search by name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 py-2.5 pl-10 pr-14 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800/50"
        />
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {statusPills.map(({ key, label }) => {
          const active = status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key)}
              className={[
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto lg:ml-auto lg:flex-nowrap">
        <label className="sr-only" htmlFor="deity-sort-filter">
          Sort by
        </label>
        <SelectInput
          id="deity-sort-filter"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as DeitiesSortBy)}
          className="min-w-[12rem] w-full sm:w-[13rem]"
        >
          <option value="name">Sort By: Name</option>
          <option value="last7">Sort By: Last 7 Days</option>
        </SelectInput>
      </div>
    </div>
  );
}
