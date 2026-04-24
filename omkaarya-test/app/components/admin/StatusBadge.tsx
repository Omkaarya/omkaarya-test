import type { TempleStatus } from "@/lib/mock-temples";

export default function StatusBadge({ status }: { status: TempleStatus | "Inactive" }) {
  const styles =
    status === "Active"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
      : status === "Trial"
        ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
        : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}
