// src/types/product.ts
export interface Product {
    id: string;
    name: string;
    totalCost: number;
    initialStock: number;
    currentStock: number;
    sellPrice: number;
  }