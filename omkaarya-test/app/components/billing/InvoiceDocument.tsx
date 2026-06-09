"use client";

import { TruncateText } from "@/app/components/ds/atoms/TruncateText";
import {
  BILLING_LOGO_PATH,
  billToPreviewLines,
  formatInvoiceDate,
  formatMoneyOrZero,
  resolveBillingIssuer,
} from "@/lib/billing/invoice-defaults";
import type { InvoiceDocumentData } from "@/lib/billing/invoice-types";

export type InvoiceDocumentProps = InvoiceDocumentData & {
  className?: string;
  compact?: boolean;
};

export function InvoiceDocument({
  invoiceNumber,
  issuedDate,
  dueDate,
  statusLabel,
  issuer: issuerPartial,
  billTo,
  lineItems,
  currency,
  taxRateBps = 0,
  taxLabel = "Tax",
  paymentMethodLabel = "Bank transfer",
  bank,
  paymentReference,
  showBankBlock = true,
  className = "",
  compact = false,
}: InvoiceDocumentProps) {
  const issuer = resolveBillingIssuer(issuerPartial);
  const subtotalCents = lineItems.reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  const taxCents = Math.max(0, Math.round((subtotalCents * taxRateBps) / 10_000));
  const totalCents = subtotalCents + taxCents;
  const subtotal = formatMoneyOrZero(subtotalCents, currency);
  const tax = formatMoneyOrZero(taxCents, currency);
  const total = formatMoneyOrZero(totalCents, currency);

  return (
    <div className={`bg-surface ${className}`.trim()}>
      <div className={`flex justify-between items-start mb-6 pb-5 border-b-2 border-brand gap-4 ${compact ? "mb-4 pb-4" : ""}`}>
        <div className="min-w-0 flex-1">
          <img
            src={BILLING_LOGO_PATH}
            alt="Omkaarya"
            className="h-8 w-auto max-w-[180px]"
          />
          <TruncateText className="text-[11px] text-text-tertiary mt-0.5 break-words" title={issuer.name}>
            {issuer.name}
          </TruncateText>
          <p className="text-[11px] text-text-tertiary break-words whitespace-pre-line">{issuer.address}</p>
          <TruncateText className="text-[11px] text-text-tertiary" title={issuer.email}>
            {issuer.email}
          </TruncateText>
          {issuer.website ? (
            <TruncateText className="text-[11px] text-text-tertiary" title={issuer.website}>
              {issuer.website}
            </TruncateText>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-text-primary">INVOICE</p>
          <p className="text-xs font-mono text-text-tertiary mt-1">{invoiceNumber}</p>
          <p className="text-[11px] text-text-tertiary mt-1">Issued: {formatInvoiceDate(issuedDate)}</p>
          <p className="text-[11px] text-text-tertiary">Due: {formatInvoiceDate(dueDate)}</p>
          {statusLabel ? <p className="text-[11px] font-semibold text-text-secondary mt-1">{statusLabel}</p> : null}
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 ${compact ? "gap-4 mb-4" : ""}`}>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">From</p>
          <p className="text-sm font-bold text-text-primary break-words">{issuer.name}</p>
          <p className="text-[11px] text-text-tertiary leading-relaxed break-words whitespace-pre-line">
            {issuer.address}
            {"\n"}
            {issuer.email}
            {issuer.website ? `\n${issuer.website}` : ""}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1.5">Bill to</p>
          <TruncateText className="text-sm font-bold text-text-primary" title={billTo.templeName}>
            {billTo.templeName}
          </TruncateText>
          <p className="text-[11px] text-text-tertiary leading-relaxed whitespace-pre-line break-words">
            {billToPreviewLines(billTo)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border mb-4">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-border bg-subtle">
              <th className="w-[46%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Description
              </th>
              <th className="w-[12%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Qty
              </th>
              <th className="w-[21%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Unit price
              </th>
              <th className="w-[21%] px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-border last:border-b-0">
                <td className="min-w-0 overflow-hidden px-3 py-2.5 text-xs text-text-primary">
                  <TruncateText title={item.description}>{item.description}</TruncateText>
                  {item.subtitle ? (
                    <TruncateText className="text-[10px] text-text-tertiary">{item.subtitle}</TruncateText>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-xs text-text-secondary">{item.qty}</td>
                <td className="px-3 py-2.5 text-xs text-text-secondary">
                  {formatMoneyOrZero(item.unitPriceCents, currency)}
                </td>
                <td className="px-3 py-2.5 text-xs text-right font-semibold text-text-primary">
                  {formatMoneyOrZero(item.amountCents, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-subtle rounded-lg p-4 mb-4">
        <div className="flex justify-between text-xs text-text-secondary py-1">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex justify-between text-xs text-text-secondary py-1">
          <span>
            {taxLabel} ({(taxRateBps / 100).toFixed(2)}%)
          </span>
          <span>{tax}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-text-primary pt-2 mt-2 border-t border-border">
          <span>Total due</span>
          <span className="text-brand">{total}</span>
        </div>
      </div>

      {showBankBlock && bank ? (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">{paymentMethodLabel}</p>
          {bank.header ? <p className="text-[11px] font-semibold text-text-primary mb-3">{bank.header}</p> : null}
          <div className="flex flex-wrap gap-4">
            {bank.bankName ? (
              <div>
                <p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Bank</p>
                <p className="text-xs font-semibold text-text-primary break-words">{bank.bankName}</p>
              </div>
            ) : null}
            {bank.branchName ? (
              <div>
                <p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Branch</p>
                <p className="text-xs font-semibold text-text-primary break-words">{bank.branchName}</p>
              </div>
            ) : null}
            {bank.accountName ? (
              <div>
                <p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Account name</p>
                <p className="text-xs font-semibold text-text-primary break-words">{bank.accountName}</p>
              </div>
            ) : null}
            {bank.accountNumber ? (
              <div>
                <p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">Account no.</p>
                <p className="text-xs font-semibold text-text-primary break-words">{bank.accountNumber}</p>
              </div>
            ) : null}
            {bank.swift ? (
              <div>
                <p className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-0.5">SWIFT</p>
                <p className="text-xs font-semibold text-text-primary break-words">{bank.swift}</p>
              </div>
            ) : null}
          </div>
          {paymentReference ? (
            <div className="mt-3 rounded-lg border-[1.5px] border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                Payment reference (include in your transfer)
              </p>
              <p className="text-sm font-bold font-mono text-text-primary break-all">{paymentReference}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {bank?.notes ? (
        <p className="text-[11px] text-text-tertiary leading-relaxed border-t border-border pt-3 break-words">
          {bank.notes}
        </p>
      ) : null}
    </div>
  );
}
