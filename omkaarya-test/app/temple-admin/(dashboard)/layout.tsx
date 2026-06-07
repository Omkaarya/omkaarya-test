"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { TempleDashboardShell } from "@/app/components/temple-admin/TempleDashboardShell";
import { useTheme } from "@/app/components/ThemeProvider";

export default function TempleDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TempleDashboardShell
      pathname={pathname}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {children}
    </TempleDashboardShell>
  );
}
