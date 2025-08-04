// src/components/CartSidebar.tsx
'use client';

import { Product } from '@/types/product';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

// Re-using the CartItem type definition
export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
}

interface CartSidebarProps {
  cart: CartItem[];
  isSubmitting: boolean;
  handleUpdateQuantity: (productId: string, newQuantity: number) => void;
  handleConfirmOrder: () => void;
  handleClearCart: () => void;
}

export default function CartSidebar({ 
  cart, 
  isSubmitting, 
  handleUpdateQuantity, 
  handleConfirmOrder, 
  handleClearCart 
}: CartSidebarProps) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  return (
    <div className="bg-white h-full rounded-2xl shadow-xl border-2 border-gray-200 flex flex-col">
      {/* Cart Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-brand-primary rounded-full p-2">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <p className="text-sm text-gray-600">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} • {cart.length} {cart.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <ShoppingCart size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500">Add some products to get started</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto">
            <div className="p-4 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <span>₹{item.sellPrice.toFixed(2)} each</span>
                        <span>Stock: {item.currentStock}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                          disabled={isSubmitting}
                        >
                          <Minus size={14} />
                        </button>
                        
                        <div className="bg-white border border-gray-300 rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
                          <span className="font-semibold text-gray-800 text-sm">{item.quantity}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} 
                          className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg w-7 h-7 flex items-center justify-center transition-colors"
                          disabled={isSubmitting || item.quantity >= item.currentStock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-800 mb-2">
                        ₹{(item.sellPrice * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 0)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        disabled={isSubmitting}
                        title="Remove from cart"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600">
                <div className="text-sm">Total ({cartItemCount} items)</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">₹{cartTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="space-y-2 flex flex-row gap-2">
            <button
                onClick={handleClearCart}
                disabled={isSubmitting}
                className="w-[40%] h-[4rem] bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-[60%] h-[4rem] bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Complete Sale
                  </>
                )}
              </button>
              
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}