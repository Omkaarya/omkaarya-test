"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { redirectToSuperAdminLogin } from "@/lib/super-admin-login";

export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
  const shouldTrackInactivity =
    pathname.startsWith("/temple-admin") || pathname.startsWith("/super-admin");

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
      if (pathname.startsWith("/temple-admin")) {
        window.location.replace("/temple-admin/signin");
      } else {
        redirectToSuperAdminLogin();
      }
    } catch (error) {
      console.error("Auto logout failed", error);
    }
  }, [pathname]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(logout, INACTIVITY_LIMIT_MS);
  }, [logout]);

  useEffect(() => {
    if (
      !shouldTrackInactivity ||
      pathname === "/super-admin/login" ||
      pathname === "/super-admin/invite" ||
      pathname === "/temple-admin/signin"
    ) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    // Initialize timer
    resetTimer();

    // Attach event listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, resetTimer, shouldTrackInactivity]);

  return <>{children}</>;
}
