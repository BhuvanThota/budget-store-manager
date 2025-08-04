// src/types/product.ts

// REFACTORED: This interface now matches the simplified Product model in schema.prisma
export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  totalStock: number;
  currentStock: number;
  stockThreshold: number;
  createdAt: string;
  updatedAt: string;
  shopId: string;
}

// This interface is used for the Point of Sale system
export interface CartItem extends Product {
  quantity: number;
  costAtSale: number; // The costPrice of the item at the moment of sale
}