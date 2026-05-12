"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchTempleAdminJson, type SettingsAreaResponse } from "@/lib/temple-admin-api";

/**
 * Hook for loading + patching a temple settings area.
 * Returns `{ payload, loading, saving, error, save, reload }` where `save(patch)`
 * calls PATCH and updates local state on success.
 */
export function useTempleSettings<T extends Record<string, unknown>>(area: string, initial?: T) {
  const [payload, setPayload] = useState<T>((initial ?? {}) as T);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTempleAdminJson<SettingsAreaResponse>(`/api/temple-admin/settings/${area}`);
      setPayload((data.payload as T) ?? ({} as T));
      setUpdatedAt(data.updatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }, [area]);

  useEffect(() => { reload(); }, [reload]);

  const save = useCallback(
    async (patch: Partial<T>) => {
      setSaving(true);
      setError(null);
      try {
        const data = await fetchTempleAdminJson<SettingsAreaResponse>(`/api/temple-admin/settings/${area}`, {
          method: "PATCH",
          body: JSON.stringify({ payload: patch }),
        });
        setPayload((data.payload as T) ?? ({} as T));
        setUpdatedAt(data.updatedAt);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save settings.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [area]
  );

  /** Replace (PUT) the entire payload — useful for tree/feature lists. */
  const replace = useCallback(
    async (next: T) => {
      setSaving(true);
      setError(null);
      try {
        const data = await fetchTempleAdminJson<SettingsAreaResponse>(`/api/temple-admin/settings/${area}`, {
          method: "PUT",
          body: JSON.stringify({ payload: next }),
        });
        setPayload((data.payload as T) ?? ({} as T));
        setUpdatedAt(data.updatedAt);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save settings.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [area]
  );

  return { payload, setPayload, loading, saving, error, updatedAt, save, replace, reload };
}
