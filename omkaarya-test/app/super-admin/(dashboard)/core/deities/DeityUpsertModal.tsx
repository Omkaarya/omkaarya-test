"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Flag, Maximize2, Minimize2, X } from "lucide-react";
import FormField from "@/app/components/admin/FormField";
import LogoUpload from "@/app/components/admin/LogoUpload";
import PostSaveSuccessBanner from "@/app/components/admin/PostSaveSuccessBanner";
import TextInput from "@/app/components/admin/TextInput";
import UnsavedChangesDialog from "@/app/components/admin/UnsavedChangesDialog";
import { Button } from "@/app/components/ds/atoms/Button";
import type { MasterDeityRow } from "@/lib/master-deities";
import { fileToDataUrl } from "@/lib/file-to-data-url";
import { formSnapshot } from "@/lib/form-snapshot";
import { useModalFormSession } from "@/lib/use-modal-form-session";

export type DeityModalMode = "create" | "edit" | "view";

type DeityUpsertModalProps = {
  open: boolean;
  mode: DeityModalMode;
  initial: MasterDeityRow | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Align with Express `JSON_BODY_LIMIT` default (`10mb`) used for temple create payloads. */
const MAX_BYTES = 10 * 1024 * 1024;

export default function DeityUpsertModal({ open, mode, initial, onClose, onSaved }: DeityUpsertModalProps) {
  const dialogId = useId();
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [persistedImageUrl, setPersistedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isView = mode === "view";
  const baselineRef = useRef("");

  const formState = useMemo(
    () => ({ name, isActive, persistedImageUrl, hasImageFile: Boolean(imageFile) }),
    [name, isActive, persistedImageUrl, imageFile],
  );
  const isDirty = !isView && baselineRef.current !== "" && formSnapshot(formState) !== baselineRef.current;
  const session = useModalFormSession({ isDirty, onClose });

  const reset = useCallback(() => {
    setExpanded(false);
    setName("");
    setIsActive(true);
    setImageFile(null);
    setPersistedImageUrl(null);
    setError(null);
    setSaving(false);
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
      setImageFile(null);
    } else {
      setName("");
      setIsActive(true);
      setPersistedImageUrl(null);
      setImageFile(null);
    }
    setError(null);
    baselineRef.current = formSnapshot({
      name: initial?.name ?? "",
      isActive: initial?.isActive ?? true,
      persistedImageUrl: initial?.imageDataUrl ?? null,
      hasImageFile: false,
    });
  }, [open, initial, reset]);

  const onDeityImageChange = useCallback((file: File | null) => {
    setError(null);
    if (!file) {
      setImageFile(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Image must be under ${Math.round(MAX_BYTES / (1024 * 1024))}MB.`);
      return;
    }
    setImageFile(file);
  }, []);

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
      if (imageFile) {
        try {
          imagePayload = await fileToDataUrl(imageFile);
        } catch {
          setError("Could not read the image file.");
          return;
        }
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
      const msg = mode === "create" ? "Deity created successfully." : "Deity updated successfully.";
      session.completeSuccess(msg, () => {
        onSaved();
        onClose();
      });
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
        onClick={isView ? onClose : session.requestClose}
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
                onClick={isView ? onClose : session.requestClose}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <PostSaveSuccessBanner text={session.postSave.bannerText} className="mx-5 mt-4" />
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {error ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Image</label>
              <LogoUpload
                file={imageFile}
                onFileChange={onDeityImageChange}
                initialDataUrl={persistedImageUrl}
                placeholderLabel="Deity"
                disabled={isView}
              />
              <p className="max-w-lg text-xs text-zinc-400 dark:text-zinc-500">
                Same as temple logo: any raster or SVG the browser accepts as an image, max{" "}
                {Math.round(MAX_BYTES / (1024 * 1024))} MB. Sent as JSON (data URL); the catalog stores the
                hosted URL after upload.
              </p>
            </div>

            <FormField id={`${dialogId}-name`} label="Name" required>
              <TextInput
                id={`${dialogId}-name`}
                type="text"
                required
                disabled={isView}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Deity name"
              />
            </FormField>

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
            <Button type="button" variant="outline" size="sm" className="flex-1 rounded-xl" onClick={isView ? onClose : session.requestClose} disabled={session.postSave.isLocked}>
              {isView ? "Close" : "Cancel"}
            </Button>
            {!isView ? (
              <Button type="submit" variant="primary" size="sm" className="flex-1 rounded-xl" loading={saving} disabled={session.postSave.isLocked}>
                Save
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      {!isView ? (
        <UnsavedChangesDialog
          dialogRef={session.modalGuard.dialogRef}
          onStay={session.modalGuard.closeDialog}
          onLeave={session.modalGuard.confirmLeave}
        />
      ) : null}
    </div>
  );
}
