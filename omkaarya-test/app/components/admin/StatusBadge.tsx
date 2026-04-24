import type { TempleStatus } from "@/lib/mock-temples";

type ExtendedStatus = TempleStatus | "Inactive" | "Approved" | "Pending" | "Rejected" | "Suspended";

export default function StatusBadge({ status }: { status: ExtendedStatus | string }) {
  let styles = "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"; // Default

  const s = status.toLowerCase();

  if (s === "active" || s === "approved" || s === "verified") {
    styles = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
  } else if (s === "trial" || s === "pending") {
    styles = "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300";
  } else if (s === "suspended" || s === "rejected" || s === "inactive" || s === "expired") {
    styles = "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}
