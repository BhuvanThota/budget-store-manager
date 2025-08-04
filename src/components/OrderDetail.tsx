// src/components/OrderDetail.tsx
'use client';

import { Order } from '@/types/order';
import { Edit, Trash2, ClipboardList, X } from 'lucide-react';

interface OrderDetailProps {
  order: Order | null;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onClose?: () => void; // Optional close handler for mobile
  isEmbedded?: boolean;
}

export default function OrderDetail({ order, onEdit, onDelete, onClose, isEmbedded = false }: OrderDetailProps) {
  if (!order && !isEmbedded) {
    return (
      <div className="bg-white h-full p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 border-dashed">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <ClipboardList size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600">Select an Order</h3>
        <p className="text-gray-500 mt-1">Choose an order from the list to see its details.</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className={`bg-white h-full flex flex-col relative ${isEmbedded ? '' : 'p-6 rounded-lg shadow-md'}`}>
      {/* ADDED: Close button for embedded/modal view */}
      {isEmbedded && (
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label="Close details"
        >
          <X size={18} />
        </button>
      )}

      <div className={`flex justify-between items-start border-b pb-4 mb-4 ${isEmbedded ? 'p-4' : ''}`}>
        <div>
          <h3 className="font-bold text-xl text-brand-primary">Order #{order.orderId}</h3>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        {/* Added margin to prevent overlap with the new close button */}
        <p className="font-bold text-2xl text-gray-800 mr-10">₹{order.totalAmount.toFixed(2)}</p>
      </div>

      <div className={`flex-grow overflow-y-auto ${isEmbedded ? 'px-4' : 'pr-2'}`}>
        <h4 className="font-semibold text-gray-700 mb-2">Items in this order:</h4>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-gray-800 bg-gray-50 p-3 rounded-md">
              <div>
                <span className="font-semibold">{item.productName}</span>
                <span className="text-gray-500 block">
                  {item.quantity} &times; ₹{item.soldAt.toFixed(2)}
                </span>
              </div>
              <span className="font-semibold">₹{(item.quantity * item.soldAt).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-4 flex gap-3 ${isEmbedded ? 'p-4 border-t' : 'pt-4 border-t'}`}>
        <button
          onClick={() => onEdit(order)}
          className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Edit size={16} /> Edit Order
        </button>
        <button
          onClick={() => onDelete(order)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}