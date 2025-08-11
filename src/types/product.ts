// src/types/product.ts

import { Category } from './category';

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  floorPrice: number; // NEW: Add floorPrice to the type
  totalStock: number;
  currentStock: number;
  stockThreshold: number;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  categoryId?: string | null;
  category?: Category | null;
}

export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
  discount?: number;
}