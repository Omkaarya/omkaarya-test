function sanitizePdfFilename(name: string): string {
  const base = name.trim() || "invoice";
  return base.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 120);
}

/**
 * Fetches the printable invoice HTML and saves it as a PDF file in the browser.
 */
export async function downloadInvoiceAsPdf(invoiceId: string, invoiceNumber: string): Promise<void> {
  const res = await fetch(`/api/billing/invoices/${encodeURIComponent(invoiceId)}/print`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load invoice for PDF download");
  }

  const html = await res.text();
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const mount = document.createElement("div");
  mount.style.position = "fixed";
  mount.style.left = "-10000px";
  mount.style.top = "0";
  mount.style.width = "640px";
  mount.style.background = "#ffffff";

  while (parsed.body.firstChild) {
    mount.appendChild(parsed.body.firstChild);
  }
  document.body.appendChild(mount);

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `${sanitizePdfFilename(invoiceNumber)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(mount)
      .save();
  } finally {
    document.body.removeChild(mount);
  }
}
