// src/components/pos/MobileProductListItem.tsx
'use client';

import { Product, CartItem } from '@/types/product';
import { Plus, Minus } from 'lucide-react';

interface MobileProductListItemProps {
  product: Product;
  cartItem: CartItem | undefined;
  handleUpdateQuantity: (productId: string, newQuantity: number) => void;
  handleAddToCart: (product: Product) => void;
}

export default function MobileProductListItem({ 
  product, 
  cartItem, 
  handleUpdateQuantity, 
  handleAddToCart 
}: MobileProductListItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-3 flex items-center justify-between gap-3">
      {/* Left side: Product Info */}
      <div className="flex-grow">
        <h3 className="font-bold text-gray-800 text-sm leading-tight">
          {product.name}
        </h3>
        <div className="space-y-1 mt-1">
          <div className="text-sm font-bold text-brand-primary">₹{product.sellPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Stock: {product.currentStock}</div>
        </div>
      </div>
      
      {/* Right side: Action Buttons */}
      <div className="flex-shrink-0">
        {cartItem ? (
          <div className="flex items-center justify-center gap-1.5">
            <button 
              onClick={() => handleUpdateQuantity(product.id, cartItem.quantity - 1)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <Minus size={12} />
            </button>
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-[2rem] text-center">
              <span className="font-bold text-sm text-gray-800">{cartItem.quantity}</span>
            </div>
            <button 
              onClick={() => handleUpdateQuantity(product.id, cartItem.quantity + 1)}
              disabled={cartItem.quantity >= product.currentStock}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <Plus size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleAddToCart(product)}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-1.5 px-3 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 text-xs"
          >
            <Plus size={12} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};