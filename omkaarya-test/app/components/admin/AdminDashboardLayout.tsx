"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminDashboardMainPanel } from "@/app/components/admin/AdminDashboardMainPanel";
import { AdminDashboardShell } from "@/app/components/admin/AdminDashboardShell";
import { SuperAdminSessionGuard } from "@/app/components/admin/SuperAdminSessionGuard";
import { useTheme } from "@/app/components/ThemeProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const templesActive =
    pathname === "/super-admin/core/temples" ||
    pathname.startsWith("/super-admin/create-temple") ||
    pathname.startsWith("/super-admin/edit-temple");

  return (
    <SuperAdminSessionGuard>
    <AdminDashboardShell
      pathname={pathname}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      templesActive={templesActive}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <AdminDashboardMainPanel>{children}</AdminDashboardMainPanel>
    </AdminDashboardShell>
    </SuperAdminSessionGuard>
  );
}
