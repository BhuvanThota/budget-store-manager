// src/components/pos/DesktopProductCard.tsx
'use client';

import { Product, CartItem } from '@/types/product';
import { Plus, Minus } from 'lucide-react';

interface DesktopProductCardProps {
  product: Product;
  cartItem: CartItem | undefined;
  handleUpdateQuantity: (productId: string, newQuantity: number) => void;
  handleAddToCart: (product: Product) => void;
}

export default function DesktopProductCard({ 
  product, 
  cartItem, 
  handleUpdateQuantity, 
  handleAddToCart 
}: DesktopProductCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg ${
        cartItem ? 'border-brand-primary ring-2 ring-brand-primary ring-opacity-20' : 'border-gray-200'
      }`}
    >
      <div className="p-3">
        <div className="text-center">
          <h3 className="font-bold text-gray-800 text-md leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="space-y-1 my-2">
            <div className="text-sm font-bold text-brand-primary">₹{product.sellPrice.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Stock: {product.currentStock}</div>
          </div>
        </div>
        {cartItem ? (
          <div className="flex items-center justify-center gap-1">
            <button 
              onClick={() => handleUpdateQuantity(product.id, cartItem.quantity - 1)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <Minus size={14} />
            </button>
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
              <span className="font-bold text-md text-gray-800">{cartItem.quantity}</span>
            </div>
            <button 
              onClick={() => handleUpdateQuantity(product.id, cartItem.quantity + 1)}
              disabled={cartItem.quantity >= product.currentStock}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full w-7 h-7 flex items-center justify-center transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleAddToCart(product)}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-2 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1 text-sm"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};