// src/components/purchase-orders/PurchaseOrderDetail.tsx
'use client';

import { PurchaseOrder } from '@/types/purchaseOrder';
import { Package, Calendar, User, FileText, Hash, Trash2 } from 'lucide-react';

interface PurchaseOrderDetailProps {
  order: PurchaseOrder;
  onDelete: () => void;
  isDeletable: boolean;
}

export default function PurchaseOrderDetail({ order, onDelete, isDeletable }: PurchaseOrderDetailProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border h-full flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-brand-text mb-4 border-b pb-2 flex items-center gap-2">
          <Hash size={18} />
          Details for PO #{order.purchaseOrderId}
        </h3>
        {/* ADDED: Conditional Delete Button */}
        <button
          onClick={() => onDelete()}
          disabled={!isDeletable}
          className="p-2 text-red-600 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-red-100 disabled:hover:bg-transparent"
          title={isDeletable ? 'Delete Order' : 'Deletion only allowed within 24 hours'}
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="space-y-3 text-sm flex-grow">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</span>
        </div>
        {order.supplierDetails && (
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <span><strong>Supplier:</strong> {order.supplierDetails}</span>
          </div>
        )}
        {order.notes && (
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-gray-500 mt-0.5" />
            <span><strong>Notes:</strong> {order.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
          <Package size={18} />
          Items in this Order
        </h4>
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          <ul className="divide-y">
            {order.items.map(item => (
              <li key={item.id} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{item.productName}</p>
                  <p className="text-gray-500">Qty: {item.quantityOrdered}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{(item.quantityOrdered * item.costPricePerItem).toFixed(2)}</p>
                  <p className="text-gray-500">(@ ₹{item.costPricePerItem.toFixed(2)} each)</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
       <div className="mt-4 border-t pt-3 text-right">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-xl font-bold ml-2 text-brand-text">₹{order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  );
}