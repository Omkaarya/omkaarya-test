import type { ReactNode } from "react";

type AdminDataTableProps = {
  headers: ReactNode[];
  children: ReactNode;
  minWidthClassName?: string;
  empty?: ReactNode;
  isEmpty?: boolean;
};

export default function AdminDataTable({
  headers,
  children,
  minWidthClassName = "min-w-[900px]",
  empty,
  isEmpty,
}: AdminDataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${minWidthClassName}`}>
        <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/40">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 ${
                  idx === headers.length - 1 ? "text-right" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</tbody>
      </table>
      {isEmpty ? (
        empty ?? <p className="px-4 py-12 text-center text-sm text-zinc-500">No records found.</p>
      ) : null}
    </div>
  );
}
