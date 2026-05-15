"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CloudUpload, Flag, ImageIcon, Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import type { MasterDeityRow } from "@/lib/master-deities";

export type DeityModalMode = "create" | "edit" | "view";

type DeityUpsertModalProps = {
  open: boolean;
  mode: DeityModalMode;
  initial: MasterDeityRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

const ACCEPT = "image/svg+xml,image/png,image/jpeg,image/jpg";
const MAX_BYTES = 2 * 1024 * 1024;

export default function DeityUpsertModal({ open, mode, initial, onClose, onSaved }: DeityUpsertModalProps) {
  const dialogId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [persistedImageUrl, setPersistedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isView = mode === "view";

  const reset = useCallback(() => {
    setExpanded(false);
    setName("");
    setIsActive(true);
    setImageFile(null);
    setImageDataUrl(null);
    setPersistedImageUrl(null);
    setError(null);
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    if (initial) {
      setName(initial.name);
      setIsActive(initial.isActive);
      setPersistedImageUrl(initial.imageDataUrl);
      setImageDataUrl(null);
      setImageFile(null);
    } else {
      setName("");
      setIsActive(true);
      setPersistedImageUrl(null);
      setImageDataUrl(null);
      setImageFile(null);
    }
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, initial, reset]);

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (imageDataUrl) return imageDataUrl;
    if (persistedImageUrl) return persistedImageUrl;
    return null;
  }, [imageFile, imageDataUrl, persistedImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const applyFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(`Image must be under ${Math.round(MAX_BYTES / (1024 * 1024))}MB.`);
      return;
    }
    setError(null);
    setImageFile(file);
    try {
      const url = await readFileAsDataUrl(file);
      setImageDataUrl(url);
    } catch {
      setError("Could not read the image file.");
    }
  };

  const title =
    mode === "create" ? "Add New Deity" : mode === "edit" ? "Edit Deity" : "View Deity";
  const subtitle =
    mode === "create"
      ? "Create a new deity details."
      : mode === "edit"
        ? "Update deity details."
        : "Deity details (read-only).";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;
    setError(null);
    setSaving(true);
    try {
      let imagePayload: string | null = persistedImageUrl;
      if (imageFile && imageDataUrl) {
        imagePayload = imageDataUrl;
      }

      if (mode === "create") {
        const res = await fetch("/api/super-admin/deities", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            isActive,
            imageDataUrl: imagePayload,
            secondaryLabel: null,
            countryCode: null,
            placeholderHue: null,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setError(json?.error?.message ?? "Failed to create deity.");
          return;
        }
      } else if (mode === "edit" && initial) {
        const res = await fetch(`/api/super-admin/deities/${encodeURIComponent(initial.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            isActive,
            imageDataUrl: imagePayload,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setError(json?.error?.message ?? "Failed to update deity.");
          return;
        }
      }
      onSaved();
      onClose();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        className={[
          "relative z-10 flex max-h-[min(90vh,880px)] w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
          expanded ? "max-w-4xl" : "max-w-lg",
        ].join(" ")}
      >
        <div className="shrink-0 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                aria-hidden
              >
                <Flag className="h-5 w-5 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h2 id={`${dialogId}-title`} className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {title}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label={expanded ? "Restore modal size" : "Expand modal"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {error ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Image</label>
              <div className="flex flex-wrap items-stretch gap-3">
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/50"
                  aria-hidden
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5 text-zinc-400">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-[10px] font-medium">+</span>
                    </div>
                  )}
                </div>

                <div
                  className={[
                    "flex min-h-[6.5rem] min-w-[12rem] flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center transition-colors dark:border-zinc-600 dark:bg-zinc-800/40",
                    isView ? "pointer-events-none opacity-70" : "hover:border-[var(--brand-primary)]/50",
                  ].join(" ")}
                  onDragOver={(e) => {
                    if (isView) return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (isView) return;
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    void applyFile(f ?? null);
                  }}
                  onClick={() => !isView && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (isView) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role={isView ? undefined : "button"}
                  tabIndex={isView ? -1 : 0}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    disabled={isView}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void applyFile(f ?? null);
                    }}
                  />
                  <CloudUpload className="mx-auto mb-2 h-8 w-8 text-zinc-400" aria-hidden />
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="font-semibold text-[var(--brand-primary)]">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">SVG, PNG, JPG or JPEG (max. 800×400px recommended)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-1.5">
              <label htmlFor={`${dialogId}-name`} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id={`${dialogId}-name`}
                type="text"
                required
                disabled={isView}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Deity name"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none ring-[var(--brand-primary)] focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800/50"
              />
            </div>

            <div className="mt-6 space-y-2">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Status <span className="text-red-500">*</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isView}
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((v) => !v)}
                  className={[
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:opacity-60",
                    isActive ? "bg-[var(--brand-primary)]" : "bg-zinc-300 dark:bg-zinc-600",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                      isActive ? "left-5" : "left-0.5",
                    ].join(" ")}
                  />
                </button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex gap-3 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl" onClick={onClose}>
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView ? (
              <Button type="submit" variant="primary" size="sm" className="flex-1 rounded-xl" loading={saving}>
                Save
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
