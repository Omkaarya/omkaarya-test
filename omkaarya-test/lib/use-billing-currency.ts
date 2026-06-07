"use client";

import { useEffect, useState } from "react";

const DEFAULT_CURRENCY = "INR";

let cachedCurrency: string | null = null;

export function useBillingCurrency(): string {
  const [currency, setCurrency] = useState(cachedCurrency ?? DEFAULT_CURRENCY);

  useEffect(() => {
    if (cachedCurrency) {
      setCurrency(cachedCurrency);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/billing/profile", { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as {
          success?: boolean;
          data?: { money?: { currency?: string } };
        } | null;
        const code =
          json?.success && json.data?.money?.currency
            ? String(json.data.money.currency).toUpperCase()
            : DEFAULT_CURRENCY;
        if (!cancel) {
          cachedCurrency = code;
          setCurrency(code);
        }
      } catch {
        if (!cancel) setCurrency(DEFAULT_CURRENCY);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return currency;
}
