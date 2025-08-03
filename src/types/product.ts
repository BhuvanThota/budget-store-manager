// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  totalCost: number;
  initialStock: number;
  currentStock: number;
  sellPrice: number;
  stockThreshold: number;
}

// Add this new interface
export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
}