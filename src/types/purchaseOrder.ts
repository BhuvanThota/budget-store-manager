// src/types/purchaseOrder.ts - Derived from our finalized Prisma schema


/**
 * Represents the status of a purchase order.
 * Corresponds to the `PurchaseOrderStatus` enum in `schema.prisma`.
 */
export type PurchaseOrderStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

/**
 * Represents a single item within a purchase order.
 * Corresponds to the `PurchaseOrderItem` model in `schema.prisma`.
 */
export interface PurchaseOrderItem {
  id: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  costPricePerItem: number;
  purchaseOrderId: string;
  productId: string;
}

/**
 * Represents a full purchase order record.
 * Corresponds to the `PurchaseOrder` model in `schema.prisma`.
 */
export interface PurchaseOrder {
  id: string;
  purchaseOrderId: number;
  supplierDetails?: string | null;
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  receivedDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  shopId: string;
  items: PurchaseOrderItem[];
}

/**
 * Data structure for creating a new purchase order.
 * Used in the frontend form and passed to the API.
 */
export interface CreatePurchaseOrderData {
  supplierDetails?: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantityOrdered: number;
    costPricePerItem: number;
  }>;
}