import type { TempleCompliance } from "@/lib/mock-temples";

export default function ComplianceBadge({ compliance }: { compliance: TempleCompliance }) {
  const styles =
    compliance === "Verified"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
      : compliance === "Pending"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {compliance}
    </span>
  );
}
