import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbSegment = {
  label: string;
  href?: string;
  isCurrent?: boolean;
};

function titleCaseSlug(segment: string): string {
  return segment
    .split("-")
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Last-resort trail for `/super-admin/...` routes without explicit rules. */
function breadcrumbsForUnknownSuperAdminPath(pathname: string): BreadcrumbSegment[] {
  const rest = pathname.replace(/^\/super-admin\/?/, "").replace(/\/$/, "");
  if (!rest) {
    return [{ label: "Dashboard", isCurrent: true }];
  }
  const segments = rest.split("/").filter(Boolean);
  const lastRaw = segments[segments.length - 1] ?? "Page";
  return [
    { label: "Dashboard", href: "/super-admin/dashboard" },
    { label: titleCaseSlug(lastRaw), isCurrent: true },
  ];
}

export function getAdminBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  // ── Temple Management ──────────────────────────────────────────────
  if (pathname === "/super-admin/create-temple") {
    return [
      { label: "Temples", href: "/super-admin/core/temples" },
      { label: "Create Temple", isCurrent: true },
    ];
  }
  if (pathname.startsWith("/super-admin/edit-temple/")) {
    return [
      { label: "Temples", href: "/super-admin/core/temples" },
      { label: "Edit Temple", isCurrent: true },
    ];
  }
  if (pathname === "/super-admin/dashboard") {
    return [{ label: "Dashboard", isCurrent: true }];
  }

  // ── Core ───────────────────────────────────────────────────────────
  if (pathname === "/super-admin/core/temples") {
    return [{ label: "Core" }, { label: "Temples", isCurrent: true }];
  }
  if (pathname === "/super-admin/core/deities") {
    return [{ label: "Core" }, { label: "Deities", isCurrent: true }];
  }

  // ── Standalone primary pages ───────────────────────────────────────
  if (pathname === "/super-admin/cms") {
    return [{ label: "Website CMS", isCurrent: true }];
  }
  if (pathname === "/super-admin/subdomains") {
    return [{ label: "Subdomains", isCurrent: true }];
  }

  // ── User Management ────────────────────────────────────────────────
  if (pathname === "/super-admin/user-management/users") {
    return [
      { label: "User Management", href: "/super-admin/user-management/users" },
      { label: "Users", isCurrent: true },
    ];
  }
  if (pathname === "/super-admin/user-management/roles") {
    return [
      { label: "User Management", href: "/super-admin/user-management/users" },
      { label: "Roles & Permissions", isCurrent: true },
    ];
  }
  if (pathname.startsWith("/super-admin/user-management/roles/configure")) {
    return [
      { label: "User Management", href: "/super-admin/user-management/users" },
      { label: "Roles & Permissions", href: "/super-admin/user-management/roles" },
      { label: "Configure", isCurrent: true },
    ];
  }
  if (pathname === "/super-admin/delete-account-requests") {
    return [
      { label: "User Management", href: "/super-admin/user-management/users" },
      { label: "Delete Account Requests", isCurrent: true },
    ];
  }

  // ── System Settings ────────────────────────────────────────────────
  if (pathname.startsWith("/super-admin/system-settings/feature-registry")) {
    return [
      { label: "System Settings" },
      { label: "Feature Registry", isCurrent: true },
    ];
  }

  // ── Pricing Plans ──────────────────────────────────────────────────
  if (pathname === "/super-admin/pricing-plans/create") {
    return [
      { label: "Pricing Plans", href: "/super-admin/pricing-plans" },
      { label: "Create Plan", isCurrent: true },
    ];
  }
  if (pathname.startsWith("/super-admin/pricing-plans/") && pathname.includes("/features")) {
    return [
      { label: "Pricing Plans", href: "/super-admin/pricing-plans" },
      { label: "Plan Features", isCurrent: true },
    ];
  }
  if (pathname === "/super-admin/pricing-plans") {
    return [{ label: "Pricing Plans", isCurrent: true }];
  }

  // ── Finance ────────────────────────────────────────────────────────
  if (pathname.startsWith("/super-admin/finance")) {
    const sub = pathname.split("/super-admin/finance").pop() || "";
    const subLabel: Record<string, string> = {
      "": "Revenue Dashboard",
      "/transactions": "Transactions",
      "/invoices": "Invoices",
      "/invoices/generate": "Generate Invoice",
      "/receipts": "Receipts",
      "/receipts/view": "View Receipt",
      "/subscriptions": "Subscriptions",
      "/confirm-payments": "Confirm Payments",
      "/upcoming-renewals": "Upcoming Renewals",
    };
    return [
      { label: "Finance & Billing", href: "/super-admin/finance" },
      { label: subLabel[sub] ?? "Finance", isCurrent: true },
    ];
  }

  if (pathname.startsWith("/super-admin")) {
    return breadcrumbsForUnknownSuperAdminPath(pathname);
  }

  return breadcrumbsForUnknownSuperAdminPath(pathname);
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
      {segments.map((seg, index) => (
        <span key={`${seg.label}-${index}-${seg.href ?? ""}`} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
          {seg.href && !seg.isCurrent ? (
            <Link href={seg.href} className="hover:text-[var(--text-primary)]">
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
