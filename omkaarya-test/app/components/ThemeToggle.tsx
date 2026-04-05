"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const hideFloating =
    pathname === "/super-admin" ||
    pathname?.startsWith("/super-admin/create-temple") ||
    pathname?.startsWith("/temple-admin");
  if (hideFloating) {
    return null;
  }

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="fixed top-4 right-4 z-50 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)]/90 p-2 shadow-md backdrop-blur dark:bg-[var(--surface-card)]/80"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-[var(--brand-primary)]" />
      ) : (
        <Moon className="h-5 w-5 text-[var(--brand-primary)]" />
      )}
    </button>
  );
}
