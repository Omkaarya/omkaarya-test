"use client";

import { useCallback, useRef } from "react";

export type UseModalFormGuardOptions = {
  isDirty: boolean;
  enabled?: boolean;
  onForceClose: () => void;
};

/** Unsaved-leave guard for modals (backdrop / X / Cancel) without router navigation. */
export function useModalFormGuard({ isDirty, enabled = true, onForceClose }: UseModalFormGuardOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const forceCleanRef = useRef(false);

  const markClean = useCallback(() => {
    forceCleanRef.current = true;
  }, []);

  const requestClose = useCallback(() => {
    if (!enabled || forceCleanRef.current || !isDirty) {
      onForceClose();
      return;
    }
    dialogRef.current?.showModal();
  }, [enabled, isDirty, onForceClose]);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const confirmLeave = useCallback(() => {
    dialogRef.current?.close();
    forceCleanRef.current = true;
    onForceClose();
  }, [onForceClose]);

  return {
    markClean,
    requestClose,
    dialogRef,
    closeDialog,
    confirmLeave,
  };
}
