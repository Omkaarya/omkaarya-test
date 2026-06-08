"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isTempleAdminPublicPath, redirectToTempleAdminSignin } from "@/lib/temple-admin-login";

const REFETCH_COOLDOWN_MS = 3000;

/**
 * Verifies the temple-admin session on mount and when the user returns via Back,
 * bfcache, tab focus, or visibility — redirects to sign-in if unauthenticated.
 */
export function useTempleAdminSessionGuard(): {
  sessionReady: boolean;
  sessionError: string | null;
  retrySession: () => void;
} {
  const pathname = usePathname() ?? "";
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const verifyInFlight = useRef(false);
  const verifiedRef = useRef(false);
  const lastFetchAtRef = useRef(0);

  const verifySession = useCallback(
    async (options?: { force?: boolean }) => {
      if (!pathname.startsWith("/temple-admin") || isTempleAdminPublicPath(pathname)) {
        verifiedRef.current = true;
        setSessionReady(true);
        setSessionError(null);
        return true;
      }

      const now = Date.now();
      if (
        !options?.force &&
        verifiedRef.current &&
        now - lastFetchAtRef.current < REFETCH_COOLDOWN_MS
      ) {
        return true;
      }

      if (verifyInFlight.current) return verifiedRef.current;

      verifyInFlight.current = true;
      lastFetchAtRef.current = now;
      setSessionError(null);

      try {
        const res = await fetch("/api/temple-admin/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (res.status === 401 || res.status === 403) {
          verifiedRef.current = false;
          setSessionReady(false);
          setSessionError(null);
          redirectToTempleAdminSignin();
          return false;
        }

        if (!res.ok) {
          verifiedRef.current = false;
          setSessionReady(false);
          setSessionError(`Session check failed (${res.status}). Check your connection and try again.`);
          return false;
        }

        verifiedRef.current = true;
        setSessionReady(true);
        setSessionError(null);
        return true;
      } catch (err) {
        verifiedRef.current = false;
        setSessionReady(false);
        setSessionError(
          err instanceof Error ? err.message : "Could not verify your session. Check your connection and try again."
        );
        return false;
      } finally {
        verifyInFlight.current = false;
      }
    },
    [pathname]
  );

  useEffect(() => {
    if (!verifiedRef.current) {
      setSessionReady(false);
    }
    void verifySession({ force: true });

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

  const retrySession = useCallback(() => {
    void verifySession({ force: true });
  }, [verifySession]);

  return { sessionReady, sessionError, retrySession };
}
