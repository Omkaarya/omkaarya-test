import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
  isCurrent?: boolean;
};

export function getAdminBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathname === "/super-admin/create-temple") {
    return [
      { label: "Temples", href: "/super-admin" },
      { label: "Create Temple", isCurrent: true },
    ];
  }
  if (pathname === "/super-admin") {
    return [{ label: "Temples", isCurrent: true }];
  }
  return [{ label: "Temples", href: "/super-admin", isCurrent: false }];
}

export function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  const segments = getAdminBreadcrumbs(pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden shrink-0 items-center gap-1 text-sm text-[var(--text-muted)] sm:flex"
    >
      <Link
        href="/"
        className="flex items-center hover:text-[var(--text-primary)]"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((seg) => (
        <span key={seg.label} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
          {seg.href && !seg.isCurrent ? (
            <Link
              href={seg.href}
              className="hover:text-[var(--text-primary)]"
            >
              {seg.label}
            </Link>
          ) : (
            <span
              className={
                seg.isCurrent
                  ? "font-medium text-[var(--brand-primary)]"
                  : "font-medium text-[var(--text-primary)]"
              }
              aria-current={seg.isCurrent ? "page" : undefined}
            >
              {seg.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
