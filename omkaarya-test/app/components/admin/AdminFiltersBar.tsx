import { Search } from "lucide-react";
import SelectInput from "@/app/components/admin/SelectInput";

type StatusFilter = "all" | "Active" | "Trial" | "Suspended";

type AdminFiltersBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  country: string;
  onCountryChange: (country: string) => void;
  countries: string[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
};

const statusPills: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Temples" },
  { key: "Active", label: "Active" },
  { key: "Trial", label: "Trial" },
  { key: "Suspended", label: "Suspended" },
];

export default function AdminFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  country,
  onCountryChange,
  countries,
  sortBy,
  onSortByChange,
}: AdminFiltersBarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-100 p-4 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-[200px] flex-1 lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Search by name, city, or admin email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 py-2 pl-10 pr-14 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800/50"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-block dark:border-zinc-600 dark:bg-zinc-800">
          ⌘K
        </kbd>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {statusPills.map(({ key, label }) => {
            const active = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onStatusChange(key)}
                className={[
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
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

        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="country-filter">
            Country
          </label>
          <SelectInput
            id="country-filter"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="min-w-[9rem]"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>

          <label className="sr-only" htmlFor="sort-filter">
            Sort by
          </label>
          <SelectInput id="sort-filter" value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            <option value="last7">Sort By: Last 7 Days</option>
            <option value="name">Sort By: Name</option>
            <option value="devotees">Sort By: Devotees</option>
          </SelectInput>
        </div>
      </div>
    </div>
  );
}
