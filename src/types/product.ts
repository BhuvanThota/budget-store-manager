// src/types/product.ts

export interface Product {
  id: string;
  name: string;
  costPrice: number;       // Make sure this matches Prisma
  sellPrice: number;
  totalStock: number;      // Make sure this matches Prisma
  currentStock: number;
  stockThreshold: number;
  createdAt: string;       // Represent dates as strings or Date
  updatedAt: string;
  shopId: string;
}

export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
}