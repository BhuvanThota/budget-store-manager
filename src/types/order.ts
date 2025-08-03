// src/types/order.ts

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    soldAt: number;
  }
  
  export interface Order {
    id: string;
    orderId: number;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
  }