import Link from "next/link";
import { Eye } from "lucide-react";

export type RecentActivityItem = {
  type: "temple_onboarded" | "subscription_upgraded" | "payment_received" | "pending_payment";
  title: string;
  subtitle: string;
  timestamp: string;
  href?: string;
};

interface RecentActivitiesFeedProps {
  items: RecentActivityItem[];
  loading?: boolean;
}

function dotColor(type: RecentActivityItem["type"]): string {
  switch (type) {
    case "temple_onboarded":
    case "payment_received":
      return "bg-status-success-text";
    case "subscription_upgraded":
      return "bg-brand";
    case "pending_payment":
      return "bg-status-danger-text";
    default:
      return "bg-text-tertiary";
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentActivitiesFeed({ items, loading }: RecentActivitiesFeedProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
      <h3 className="mb-4 text-sm font-bold text-text-primary">Recent Activities</h3>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-subtle" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center text-xs font-medium text-text-disabled">
          No recent activity
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={`${item.type}-${item.timestamp}-${i}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-subtle p-3"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor(item.type)}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-text-primary">{item.title}</p>
                <p className="text-[10px] text-text-tertiary">
                  {item.subtitle} | {formatTimestamp(item.timestamp)}
                </p>
              </div>
              {item.href && (
                <Link
                  href={item.href}
                  className="shrink-0 text-text-tertiary transition-colors hover:text-brand"
                  aria-label="View details"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
