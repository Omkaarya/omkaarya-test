/** Row from GET `/api/temple-admin/inventory/products` (proxied envelope `data.products`). */

export type TempleInventoryProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  productType: string;
  quantity: number;
  reorderPoint: number | null;
  unit: string;
  costAmount: number;
  supplierName: string | null;
  imageUrl: string | null;
  status: "ok" | "low" | "out";
};
