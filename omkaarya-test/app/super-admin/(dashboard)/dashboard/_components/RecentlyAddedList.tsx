import Link from "next/link";
import { Badge } from "@/app/components/ds/atoms/Badge";

export type RecentTempleItem = {
  tenantId: string;
  name: string;
  country: string;
  status: string;
  createdAt: string;
};

interface RecentlyAddedListProps {
  items: RecentTempleItem[];
  loading?: boolean;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "active") return { label: "Active", color: "success" as const };
  if (s === "trial") return { label: "Trial", color: "brand" as const };
  if (s === "suspended") return { label: "Suspended", color: "error" as const };
  return { label: "Pending", color: "warning" as const };
}

export function RecentlyAddedList({ items, loading }: RecentlyAddedListProps) {
  return (
    <div className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-text-primary">Recently Added</h3>
        <p className="text-xs text-text-tertiary">Latest temples onboarded to the platform</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-subtle" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs font-medium text-text-disabled">
          No temples added yet
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const badge = statusBadge(item.status);
            return (
              <li key={item.tenantId}>
                <Link
                  href={`/super-admin/view-temple/${item.tenantId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle p-3 transition-colors hover:border-brand/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {item.country} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <Badge color={badge.color} size="sm">
                    {badge.label}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
