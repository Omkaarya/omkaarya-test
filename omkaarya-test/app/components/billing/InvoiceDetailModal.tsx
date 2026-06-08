"use client";

import { Download, FileText, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import type { InvoiceDocumentData } from "@/lib/billing/invoice-types";
import { InvoiceDocument } from "./InvoiceDocument";

export function InvoiceDetailModal({
  title,
  document,
  onClose,
  onDownload,
}: {
  title: string;
  document: InvoiceDocumentData;
  onClose: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-surface px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <FileText className="h-5 w-5 text-text-tertiary" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-text-primary">{title}</h3>
              <p className="text-sm text-text-tertiary">Invoice preview</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-fg-quaternary transition-colors hover:bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <InvoiceDocument {...document} />
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onDownload ? (
            <Button variant="primary" leadingIcon={<Download className="h-4 w-4" />} onClick={onDownload}>
              Download Invoice
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
