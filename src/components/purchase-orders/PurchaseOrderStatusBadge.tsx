// src/components/purchase-orders/PurchaseOrderStatusBadge.tsx
'use client';

import { PurchaseOrderStatus } from '@/types/purchaseOrder';

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export default function PurchaseOrderStatusBadge({ status }: PurchaseOrderStatusBadgeProps) {
  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RECEIVED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusText = {
    PENDING: 'Pending',
    RECEIVED: 'Received',
    CANCELLED: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      }`}
    >
      {statusText[status] || 'Unknown'}
    </span>
  );
}
