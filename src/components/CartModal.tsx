// src/components/CartModal.tsx
'use client';

import { useRef, useEffect } from 'react';
import { Product } from '@/types/product';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';

export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onConfirmOrder: () => void;
  onClearCart: () => void;
  isSubmitting: boolean;
}

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onConfirmOrder, 
  onClearCart, 
  isSubmitting 
}: CartModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef} 
        className="relative bg-white w-full sm:w-full sm:max-w-2xl h-[90vh] sm:h-[80vh] sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary rounded-full p-2">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
              <p className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} • {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close cart"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingCart size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <button
              onClick={onClose}
              className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto">
              <div className="p-4 space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-4">
                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>₹{item.sellPrice.toFixed(2)} each</span>
                          <span>Stock: {item.currentStock}</span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                            disabled={isSubmitting}
                          >
                            <Minus size={16} />
                          </button>
                          
                          <div className="bg-white border border-gray-300 rounded-lg px-3 py-1 min-w-[3rem] text-center">
                            <span className="font-semibold text-gray-800">{item.quantity}</span>
                          </div>
                          
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                            disabled={isSubmitting || item.quantity >= item.currentStock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800 mb-2">
                          ₹{(item.sellPrice * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 0)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          disabled={isSubmitting}
                          title="Remove from cart"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white p-6 sm:rounded-b-2xl">
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-600">
                  <div className="text-sm">Total ({totalItems} items)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClearCart}
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Clear Cart
                </button>
                
                <button
                  onClick={onConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-4 text-center text-xs text-gray-500">
                Tap outside or press ESC to close
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}