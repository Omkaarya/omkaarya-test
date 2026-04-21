export type ProductStatus = "In-stock" | "Low stock" | "Out of stock";

export interface InventoryProduct {
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  quantity: number;
  unit: string;
  price: number;
  status: ProductStatus;
  supplier: string;
  createdAt: string;
  image?: string;
}

export const mockInventory: InventoryProduct[] = [
  {
    sku: "PRD001",
    name: "Incense Sticks (Sandwood)",
    category: "Pooja Items",
    subCategory: "Incense",
    quantity: 150,
    unit: "Pack",
    price: 12.50,
    status: "In-stock",
    supplier: "Ved Vyasa Spices",
    createdAt: "2024-03-15",
  },
  {
    sku: "PRD002",
    name: "Copper Pooja Thali",
    category: "Pooja Items",
    subCategory: "Utensils",
    quantity: 8,
    unit: "Unit",
    price: 45.00,
    status: "Low stock",
    supplier: "Arun Metals",
    createdAt: "2024-03-18",
  },
  {
    sku: "PRD003",
    name: "Cotton Wicks (Long)",
    category: "Pooja Items",
    subCategory: "Lamp Supplies",
    quantity: 500,
    unit: "Pack",
    price: 5.99,
    status: "In-stock",
    supplier: "Divine Wicks",
    createdAt: "2024-03-20",
  },
  {
    sku: "PRD004",
    name: "Pure Cow Ghee",
    category: "Offerings",
    subCategory: "Dairy",
    quantity: 0,
    unit: "Kg",
    price: 25.50,
    status: "Out of stock",
    supplier: "Gopal Dairy",
    createdAt: "2024-03-22",
  },
  {
    sku: "PRD005",
    name: "Brass Diya (Small)",
    category: "Pooja Items",
    subCategory: "Utensils",
    quantity: 25,
    unit: "Unit",
    price: 15.00,
    status: "In-stock",
    supplier: "Arun Metals",
    createdAt: "2024-03-25",
  }
];

export interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  inShipment: number;
}

export const mockInventoryStats: InventoryStats = {
  totalProducts: 1450,
  lowStockItems: 12,
  totalValue: 842525,
  inShipment: 5
};
