'use client';

import { AlertCircle, X } from 'lucide-react';

export interface ValidationToastProps {
  isOpen: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
}

/**
 * Reusable validation toast component
 * - Displays in fixed bottom-right corner
 * - Shows required fields validation message
 * - Includes amber alert icon and dismiss button
 * - Supports dark mode
 */
export function ValidationToast({
  isOpen,
  onDismiss,
  title = 'Required fields',
  message = 'Please fill in all required fields.',
}: ValidationToastProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[190] flex max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:bottom-6 sm:right-6"
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500"
        aria-hidden
      />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
      <button
        type="button"
        className="-m-1 shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
