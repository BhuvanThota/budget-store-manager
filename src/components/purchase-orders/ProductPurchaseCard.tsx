// src/components/purchase-orders/ProductPurchaseCard.tsx
'use client';

import { Product } from '@/types/product';
import { Plus, History, Tag } from 'lucide-react'; // NEW: Imported Tag icon

interface ProductPurchaseCardProps {
  product: Product;
  onAddPurchase: (product: Product) => void;
  onViewHistory: (product: Product) => void;
}

export default function ProductPurchaseCard({ product, onAddPurchase, onViewHistory }: ProductPurchaseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:border-brand-primary">
      <div>
        {/* NEW: Display Category if available */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-brand-primary font-semibold mb-1">
            <Tag size={12} />
            <span>{product.category.name}</span>
          </div>
        )}
        <h3 className="font-bold text-gray-800 text-md leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="space-y-1 mt-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Current Stock:</span>
            <span className={`font-semibold ${product.currentStock <= product.stockThreshold ? 'text-red-600' : 'text-gray-700'}`}>
              {product.currentStock}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Sell Price:</span>
            <span className="font-semibold text-green-600">₹{product.sellPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Avg. Cost:</span>
            <span className="font-semibold text-gray-700">₹{product.costPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 border-t pt-3">
        <button
          onClick={() => onAddPurchase(product)}
          className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-3 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Purchase
        </button>
        <button
          onClick={() => onViewHistory(product)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm"
        >
          <History size={16} />
          History
        </button>
      </div>
    </div>
  );
}