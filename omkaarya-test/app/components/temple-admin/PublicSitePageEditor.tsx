"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { fetchTempleAdminJson } from "@/lib/temple-admin-api";

type PublicSitePageEditorProps = {
  pageKey: string;
  defaultTitle: string;
  description: string;
};

export function PublicSitePageEditor({ pageKey, defaultTitle, description }: PublicSitePageEditorProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTempleAdminJson<{
          page: { title: string | null; content: Record<string, unknown> };
        }>(`/api/temple-admin/public-site/${encodeURIComponent(pageKey)}`);
        if (cancelled) return;
        const content = data.page?.content ?? {};
        setTitle(data.page?.title ?? defaultTitle);
        setBody(typeof content.body === "string" ? content.body : "");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load page content.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageKey, defaultTitle]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await fetchTempleAdminJson(`/api/temple-admin/public-site/${encodeURIComponent(pageKey)}`, {
        method: "PUT",
        body: JSON.stringify({ title, content: { body } }),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save page.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{defaultTitle}</h1>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      {error && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      {saved && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Saved.</p>}
      <input
        className="h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
      />
      <textarea
        rows={12}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Page content (markdown or plain text)"
      />
      <Button variant="primary" leadingIcon={<Save className="h-4 w-4" />} disabled={saving} onClick={() => void handleSave()}>
        {saving ? "Saving…" : "Save page"}
      </Button>
    </div>
  );
}
