"use client";

import { useCallback, useEffect, useState } from "react";
import type { MasterDeityListPayload, MasterDeityRow } from "@/lib/master-deities";

export type MasterDeityOption = {
  value: string;
  label: string;
  row: MasterDeityRow;
};

export function useMasterDeitiesOptions() {
  const [options, setOptions] = useState<MasterDeityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: "active",
        sortBy: "name",
        page: "1",
        pageSize: "200",
      });
      const res = await fetch(`/api/super-admin/deities?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        data?: MasterDeityListPayload;
        error?: { message?: string };
      };
      if (!res.ok || !json.success || !json.data) {
        setOptions([]);
        setError(json.error?.message ?? "Failed to load deities.");
        return;
      }
      setOptions(
        json.data.data
          .filter((d) => d.isActive)
          .map((d) => ({
            value: d.slug,
            label: d.name,
            row: d,
          }))
      );
    } catch {
      setOptions([]);
      setError("Failed to load deities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const optionsWithFallback = useCallback(
    (storedValue: string): MasterDeityOption[] => {
      const v = storedValue.trim();
      if (!v || options.some((o) => o.value === v || o.row.id === v)) {
        return options;
      }
      const byName = options.find((o) => o.label.toLowerCase() === v.toLowerCase());
      if (byName) return options;
      return [...options, { value: v, label: v, row: {} as MasterDeityRow }];
    },
    [options]
  );

  return { options, optionsWithFallback, loading, error, reload: load };
}
