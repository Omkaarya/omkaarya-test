import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  const show = (n: number) => pages.push(n);
  if (current <= 3) {
    show(1);
    show(2);
    show(3);
    pages.push("ellipsis");
    show(total);
    return pages;
  }
  if (current >= total - 2) {
    show(1);
    pages.push("ellipsis");
    show(total - 2);
    show(total - 1);
    show(total);
    return pages;
  }
  show(1);
  pages.push("ellipsis");
  show(current - 1);
  show(current);
  show(current + 1);
  pages.push("ellipsis");
  show(total);
  return pages;
}

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function AdminPagination({
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: AdminPaginationProps) {
  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 border-t border-zinc-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>Showing Results:</span>
        <label htmlFor="page-size" className="sr-only">
          Rows per page
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <span key={`e-${idx}`} className="px-2 text-zinc-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={[
                "min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium",
                item === page
                  ? "bg-[var(--brand-primary)] text-white"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              {item}
            </button>
          )
        )}
      </div>

      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
