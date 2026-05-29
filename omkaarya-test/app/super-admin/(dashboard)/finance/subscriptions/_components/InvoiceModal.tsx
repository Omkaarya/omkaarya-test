"use client";

import { Calendar, Download, FileText, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { formatUsdFromCents } from "@/lib/temple-pricing-plans";
import { SubscriptionRow } from "./types";
import { formatDate } from "./utils";

export function InvoiceModal({
  subscription,
  onClose,
  onDownload,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
  onDownload?: () => void;
}) {
  const invoiceStatus = subscription.status === "Active" || subscription.verifiedBy ? "Paid" : "Unpaid";
  const invoiceLabel = subscription.invoiceId ? `#${subscription.invoiceId}` : "—";
  const amount = formatUsdFromCents(subscription.amountCents);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <FileText className="h-5 w-5 text-text-tertiary" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-fg-quaternary transition-colors hover:bg-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h3 className="mt-4 text-lg font-bold text-text-primary">Invoice {invoiceLabel}</h3>
          <p className="text-sm text-text-tertiary">{subscription.templeName}</p>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">
            {subscription.templeInitials}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <FileText className="h-4 w-4 text-text-tertiary" />
              <span>{subscription.receiptId ?? "No receipt on file"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <span>Payment: {formatDate(subscription.paymentDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <span>Expires: {formatDate(subscription.expiresOn)}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="w-[30%] px-4 py-3 text-xs font-semibold text-text-tertiary">Plan</th>
                  <th className="w-[22%] px-4 py-3 text-xs font-semibold text-text-tertiary">Billing</th>
                  <th className="w-[22%] px-4 py-3 text-xs font-semibold text-text-tertiary">Amount</th>
                  <th className="w-[26%] px-4 py-3 text-xs font-semibold text-text-tertiary">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="min-w-0 overflow-hidden px-4 py-3 text-sm text-text-primary">
                    <TruncateText title={subscription.plan}>{subscription.plan}</TruncateText>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{subscription.billingCycle}</td>
                  <td className="px-4 py-3 text-sm font-semibold tabular-nums text-text-primary">{amount}</td>
                  <td className="px-4 py-3">
                    <Badge color={invoiceStatus === "Paid" ? "success" : "warning"} size="sm" dot>
                      {invoiceStatus}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-text-tertiary">{subscription.adminEmail}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Download className="h-4 w-4" />}
            disabled={!subscription.invoiceId}
            onClick={onDownload}
          >
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
