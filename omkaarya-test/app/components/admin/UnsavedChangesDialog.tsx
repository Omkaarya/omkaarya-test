"use client";

import type { RefObject } from "react";
import AdminButton from "@/app/components/admin/AdminButton";

type UnsavedChangesDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onStay: () => void;
  onLeave: () => void;
};

export default function UnsavedChangesDialog({ dialogRef, onStay, onLeave }: UnsavedChangesDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%-2rem,42rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-2xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <h3 className="text-lg font-semibold">Unsaved changes</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        You have unsaved changes. Leave without saving?
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <AdminButton variant="outline" type="button" onClick={onStay}>
          Stay
        </AdminButton>
        <AdminButton variant="primary" type="button" onClick={onLeave}>
          Leave without saving
        </AdminButton>
      </div>
    </dialog>
  );
}
