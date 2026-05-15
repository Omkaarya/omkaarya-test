"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isSuperAdminPublicPath, redirectToSuperAdminLogin } from "@/lib/super-admin-login";

/**
 * Verifies the super-admin session on mount and whenever the user returns via Back,
 * bfcache, tab focus, or visibility — redirects to login if unauthenticated.
 */
export function useSuperAdminSessionGuard(): { sessionReady: boolean } {
  const pathname = usePathname() ?? "";
  const [sessionReady, setSessionReady] = useState(false);
  const verifyInFlight = useRef(false);

  const verifySession = useCallback(async () => {
    if (!pathname.startsWith("/super-admin") || isSuperAdminPublicPath(pathname)) {
      setSessionReady(true);
      return true;
    }
    if (verifyInFlight.current) return false;
    verifyInFlight.current = true;
    try {
      const res = await fetch("/api/super-admin/me", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setSessionReady(false);
        redirectToSuperAdminLogin();
        return false;
      }
      setSessionReady(true);
      return true;
    } catch {
      setSessionReady(false);
      redirectToSuperAdminLogin();
      return false;
    } finally {
      verifyInFlight.current = false;
    }
  }, [pathname]);

  useEffect(() => {
    setSessionReady(false);
    void verifySession();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void verifySession();
    };
    const onPopState = () => {
      void verifySession();
    };
    const onFocus = () => {
      void verifySession();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void verifySession();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [verifySession]);

  return { sessionReady };
}
