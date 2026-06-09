"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { TempleDashboardShell } from "@/app/components/temple-admin/TempleDashboardShell";
import { TempleDashboardMainPanel } from "@/app/components/temple-admin/TempleDashboardMainPanel";
import { useTheme } from "@/app/components/ThemeProvider";
import { useTempleDisabledModules } from "@/lib/use-temple-disabled-modules";

export default function TempleDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const disabledModules = useTempleDisabledModules();

  return (
    <TempleDashboardShell
      pathname={pathname}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      disabledModules={disabledModules}
    >
      <TempleDashboardMainPanel>
        {children}
      </TempleDashboardMainPanel>
    </TempleDashboardShell>
  );
}
