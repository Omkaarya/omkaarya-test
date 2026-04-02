"use client";

import { CloudUpload, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";

type LogoUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  placeholderLabel?: string;
  uploadLabel?: string;
  replaceLabel?: string;
};

export default function LogoUpload({
  file,
  onFileChange,
  placeholderLabel = "Logo",
  uploadLabel = "Upload",
  replaceLabel = "Replace",
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
        aria-hidden={!previewUrl}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-zinc-400">{placeholderLabel}</span>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          onFileChange(f ?? null);
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label={file ? "Replace logo" : "Upload logo"}
        >
          <CloudUpload className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden />
          {file ? replaceLabel : uploadLabel}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"
            aria-label="Remove logo"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
