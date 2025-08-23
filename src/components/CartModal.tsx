// src/components/CartModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Product } from '@/types/product';
import { X, Plus, Minus, ShoppingCart, Trash2, ShieldCheck, Tag, ChevronDown, ChevronUp } from 'lucide-react';

export interface CartItem extends Product {
  quantity: number;
  costAtSale: number;
  discount?: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onConfirmOrder: () => void;
  onClearCart: () => void;
  isSubmitting: boolean;
  totalDiscountInput: string;
  setTotalDiscountInput: (value: string) => void;
  discountType: 'PERCENT' | 'FIXED';
  setDiscountType: (type: 'PERCENT' | 'FIXED') => void;
  cartSubtotal: number;
  finalTotalDiscount: number;
  finalCartTotal: number;
  maxCartDiscount: number;
}

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onConfirmOrder, 
  onClearCart, 
  isSubmitting,
  totalDiscountInput,
  setTotalDiscountInput,
  discountType,
  setDiscountType,
  cartSubtotal,
  finalTotalDiscount,
  finalCartTotal,
  maxCartDiscount
}: CartModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDiscountVisible, setIsDiscountVisible] = useState(false);
  const quickDiscountPercentages = [5, 10, 15, 20];

  const handleToggleDiscount = () => {
    if (isDiscountVisible) {
      setTotalDiscountInput('');
    }
    setIsDiscountVisible(!isDiscountVisible);
  }

  useEffect(() => {
    if (!isOpen) {
      setIsDiscountVisible(false);
    }
  }, [isOpen]);
  
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
        className="relative bg-white w-full sm:w-full sm:max-w-lg h-[85vh] sm:h-[75vh] sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 sm:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary rounded-full p-1.5">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Shopping Cart</h2>
              <p className="text-xs text-gray-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} • {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-3">
              <ShoppingCart size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4 text-sm">Add some products to get started</p>
            <button
              onClick={onClose}
              className="bg-brand-primary text-white px-5 py-2 rounded-lg hover:bg-brand-primary/90 transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto">
              <ul className="p-3 space-y-2">
                {cartItems.map(item => (
                  // --- UPDATED COMPACT ITEM CARD ---
                  <li key={item.id} className="py-3 flex items-center gap-3">
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        ₹{item.sellPrice.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <p className="font-bold text-sm text-gray-800 min-w-[45px] text-right">
                        ₹{(item.sellPrice * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="bg-orange-500 text-white rounded-lg w-6 h-6 flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <div className="bg-white border rounded-lg px-2 py-1 min-w-[2.5rem] text-center">
                          <span className="font-semibold text-sm">{item.quantity}</span>
                        </div>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.currentStock} className="bg-brand-primary text-white rounded-lg w-6 h-6 flex items-center justify-center disabled:opacity-50">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t bg-white p-4 sm:rounded-b-2xl">
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">Total Bill Discount</label>
                <div className="mb-4">
                <button
                  onClick={handleToggleDiscount}
                  className="w-full flex justify-between items-center text-left p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border"
                >
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-brand-primary" />
                    <span className="text-sm font-medium text-gray-700">
                      {isDiscountVisible ? 'Hide Discount Options' : 'Apply Discount'}
                    </span>
                  </div>
                  {isDiscountVisible ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>

                {isDiscountVisible && (
                  <div className="mt-3 space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-1 text-xs text-gray-500"><ShieldCheck size={14} className="text-blue-500"/><span>Max cart discount: <strong>₹{maxCartDiscount.toFixed(2)}</strong></span></div>
                    <div className="flex gap-2 pt-1">
                      {quickDiscountPercentages.map(perc => {
                          const discountAmount = (cartSubtotal * perc) / 100;
                          const isDisabled = discountAmount > maxCartDiscount;
                          return (
                              <button key={perc} onClick={() => { setDiscountType('PERCENT'); setTotalDiscountInput(String(perc)); }} disabled={isDisabled} className="flex-1 text-xs bg-blue-50 text-blue-700 rounded-full py-1 px-2 border hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                  {perc}%
                              </button>
                          )
                      })}
                    </div>
                    <div className="flex">
                      <input type="number" value={totalDiscountInput} onChange={(e) => setTotalDiscountInput(e.target.value)} className="w-full p-2 border rounded-l-md text-sm" placeholder="e.g., 10"/>
                      <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FIXED')} className="p-2 border-t border-b border-r rounded-r-md bg-gray-100 text-sm">
                        <option value="PERCENT">%</option>
                        <option value="FIXED">₹</option>
                      </select>
                    </div>
                  </div>
                )}
                </div>
              </div>
             <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
              {finalTotalDiscount > 0 && (
                <div className="flex justify-between text-red-600"><span className="text-gray-600">Total Discount</span><span>- ₹{finalTotalDiscount.toFixed(2)}</span></div>
              )}
              <hr className="my-1"/>
              <div className="flex justify-between font-bold text-lg text-brand-text"><span>Grand Total</span><span>₹{finalCartTotal.toFixed(2)}</span></div>
            </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClearCart}
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                >
                  <Trash2 size={14} />
                  Clear Cart
                </button>
                
                <button
                  onClick={onConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 min-w-[120px] text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>

              {/* Quick Info */}
              <div className="mt-3 text-center text-xs text-gray-500">
                Tap outside or press ESC to close
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}