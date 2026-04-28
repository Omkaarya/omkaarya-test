"use client";

import { Calendar, Download, Expand, FileText, X } from "lucide-react";
import { Button } from "@/app/components/ds/atoms/Button";
import { Badge } from "@/app/components/ds/atoms/Badge";
import { SubscriptionRow } from "./types";
import { formatDate } from "./utils";

export function InvoiceModal({
  subscription,
  onClose,
}: {
  subscription: SubscriptionRow;
  onClose: () => void;
}) {
  const invoiceStatus = subscription.status === "Active" || subscription.verifiedBy ? "Paid" : "Unpaid";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header — icon top-left, expand + close top-right */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-xs">
              <FileText className="h-5 w-5 text-text-tertiary" />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors">
                <Expand className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-fg-quaternary hover:bg-subtle hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-lg font-bold text-text-primary">
            Invoice #{subscription.invoiceId} Details
          </h3>
          <p className="text-sm text-text-tertiary">
            Manage your invoice details here.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Temple Avatar */}
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg">
              {subscription.templeInitials}
            </div>
          </div>

          {/* Invoice Meta */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-2">Invoice</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <FileText className="h-4 w-4 text-text-tertiary" />
                <span>{subscription.invoiceId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>Issued On: {formatDate(subscription.paymentDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>Due On: {formatDate(subscription.expiresOn)}</span>
              </div>
            </div>
          </div>

          {/* Invoice From / To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice From:</p>
              <p className="text-sm font-medium text-text-primary">Pepulux</p>
              <p className="text-sm text-text-secondary">
                2972 Westheimer Rd, Santa Ana, Illinois 85486
              </p>
              <p className="text-sm text-text-tertiary">user@example.com</p>
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Invoice To:</p>
              <p className="text-sm font-medium text-text-primary">{subscription.templeName}</p>
              <p className="text-sm text-text-secondary">
                {subscription.templeAddress}
              </p>
              <p className="text-sm text-text-tertiary">{subscription.adminEmail}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Plan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Billing Cycle</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Created On</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Expiring On</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Amount(USD)</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-tertiary">Invoice Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {subscription.plan}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {subscription.billingCycle}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(subscription.activatedOn ?? subscription.paymentDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(subscription.expiresOn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary tabular-nums">
                    ₹{subscription.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={invoiceStatus === "Paid" ? "success" : "warning"} size="sm" dot>
                      {invoiceStatus}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Info + Totals — side by side */}
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-sm font-bold text-text-primary mb-2">Payment Info</p>
              <p className="text-sm text-text-secondary">
                Credit Card: {subscription.cardLast4 ? `4216 **** **** ${subscription.cardLast4}` : "—"}
              </p>
              <p className="text-sm text-text-secondary">
                Amount: ₹{subscription.amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Sub Total</span>
                <span className="text-text-primary tabular-nums">₹{subscription.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary tabular-nums">₹0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-border">
                <span className="text-text-primary">Total</span>
                <span className="text-text-primary tabular-nums">₹{subscription.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions — light pink/rose bg like Figma */}
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-5">
            <p className="text-sm font-bold text-text-primary mb-2">
              Terms and Conditions
            </p>
            <ul className="text-sm text-text-secondary space-y-1.5 list-disc pl-4">
              <li>All payments must be made according to the agreed schedule. Late payments may incur additional fees.</li>
              <li>We are not liable for any indirect, incidental, or consequential damages, including loss of profits, revenue, or data.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" leadingIcon={<Download className="h-4 w-4" />}>
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
