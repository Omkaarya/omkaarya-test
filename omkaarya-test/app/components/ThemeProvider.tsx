"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type Context = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<Context>({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      let initial: Theme = "light";
      if (stored === "light" || stored === "dark") {
        initial = stored;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        initial = "dark";
      }
      setThemeState(initial);
      document.documentElement.setAttribute("data-theme", initial);
      localStorage.setItem("theme", initial);
    } catch (e) {
      // ignore (SSR safety)
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("theme", t);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
