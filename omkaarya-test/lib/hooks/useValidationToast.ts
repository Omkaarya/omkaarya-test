import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook for managing validation toast state with auto-dismiss functionality
 * - Shows a validation error toast in the bottom-right corner
 * - Auto-dismisses after 4.5 seconds
 * - Can be manually dismissed via X button
 * - Cleans up timer on unmount
 */
export function useValidationToast() {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(false);
  }, []);

  const show = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsOpen(true);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      timerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    show,
    dismiss,
  };
}
