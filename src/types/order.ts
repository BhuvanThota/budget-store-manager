// src/types/order.ts
import { Product } from './product';

export interface OrderItem {
  id: string;
  quantity: number;
  soldAt: number;
  costAtSale: number;
  discount: number; // Ensure this field is present
  orderId: string;
  productId: string;
  productName: string;
  product?: Product; // Include the full product for floorPrice access
}

export interface Order {
  id: string;
  orderId: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  items: OrderItem[];
}