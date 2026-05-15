"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const DEFAULT_DELAY_MS = 5000;

export type TriggerPostSaveOptions = {
  message: string;
  redirectTo?: string;
  onComplete?: () => void;
};

export type UsePostSaveSuccessOptions = {
  delayMs?: number;
  router?: AppRouterInstance;
};

export function usePostSaveSuccess({ delayMs = DEFAULT_DELAY_MS, router }: UsePostSaveSuccessOptions = {}) {
  const [message, setMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [willRedirect, setWillRedirect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setMessage(null);
    setSecondsLeft(null);
    setIsLocked(false);
    setWillRedirect(false);
  }, [clearTimers]);

  const triggerSuccess = useCallback(
    (opts: TriggerPostSaveOptions) => {
      clearTimers();
      const totalSeconds = Math.ceil(delayMs / 1000);
      setMessage(opts.message);
      setSecondsLeft(totalSeconds);
      setIsLocked(true);
      setWillRedirect(Boolean(opts.redirectTo && router));

      let remaining = totalSeconds;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setSecondsLeft(remaining);
        } else {
          setSecondsLeft(null);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        clearTimers();
        setMessage(null);
        setSecondsLeft(null);
        setIsLocked(false);
        setWillRedirect(false);
        opts.onComplete?.();
        if (opts.redirectTo && router) {
          router.push(opts.redirectTo);
        }
      }, delayMs);
    },
    [clearTimers, delayMs, router]
  );

  const bannerText =
    message && secondsLeft != null
      ? willRedirect
        ? `${message} Returning to list in ${secondsLeft}s…`
        : `${message} (${secondsLeft}s…)`
      : message;

  return {
    message,
    secondsLeft,
    isLocked,
    willRedirect,
    bannerText,
    triggerSuccess,
    reset,
  };
}
