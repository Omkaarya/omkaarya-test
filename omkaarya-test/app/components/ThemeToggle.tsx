"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="fixed top-4 right-4 z-50 bg-white/80 dark:bg-black/60 backdrop-blur p-2 rounded-full shadow-md"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-orange-500" />
      ) : (
        <Moon className="w-5 h-5 text-orange-500" />
      )}
    </button>
  );
}
