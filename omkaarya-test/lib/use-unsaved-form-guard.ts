"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type UseUnsavedFormGuardOptions = {
  isDirty: boolean;
  /** When false, navigation proceeds without prompting. */
  enabled?: boolean;
};

export function useUnsavedFormGuard({ isDirty, enabled = true }: UseUnsavedFormGuardOptions) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const forceCleanRef = useRef(false);

  const markClean = useCallback(() => {
    forceCleanRef.current = true;
  }, []);

  const effectiveDirty = enabled && isDirty && !forceCleanRef.current;

  useEffect(() => {
    if (!enabled) return;
    const fn = (e: BeforeUnloadEvent) => {
      if (forceCleanRef.current || !isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [isDirty, enabled]);

  const requestNavigate = useCallback(
    (href: string) => {
      if (!enabled || forceCleanRef.current || !isDirty) {
        router.push(href);
        return;
      }
      pendingHrefRef.current = href;
      dialogRef.current?.showModal();
      setDialogOpen(true);
    },
    [enabled, isDirty, router]
  );

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    setDialogOpen(false);
    pendingHrefRef.current = null;
  }, []);

  const confirmLeave = useCallback(() => {
    const href = pendingHrefRef.current;
    dialogRef.current?.close();
    setDialogOpen(false);
    pendingHrefRef.current = null;
    forceCleanRef.current = true;
    if (href) router.push(href);
  }, [router]);

  return {
    effectiveDirty,
    markClean,
    requestNavigate,
    dialogRef,
    dialogOpen,
    closeDialog,
    confirmLeave,
  };
}
