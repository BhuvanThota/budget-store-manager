// src/components/EditOrderModal.tsx
'use client';

import { useState, useEffect, Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Minus, Plus, Save, ShieldCheck } from 'lucide-react';
import { Order, OrderItem } from '@/types/order';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  orderToEdit: Order | null;
}

export default function EditOrderModal({ isOpen, onClose, onSave, orderToEdit }: EditOrderModalProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: Local state for managing discounts during the edit session ---
  const [totalDiscountInput, setTotalDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
 
  useEffect(() => {
    if (orderToEdit) {
      setItems(JSON.parse(JSON.stringify(orderToEdit.items)));
      
      // Initialize discount state from the existing order
      const subtotal = orderToEdit.items.reduce((sum, item) => sum + (item.quantity * item.soldAt), 0);
      const existingDiscount = subtotal - orderToEdit.totalAmount;
      
      if (existingDiscount > 0.01) {
        setDiscountType('FIXED');
        setTotalDiscountInput(existingDiscount.toFixed(2));
      } else {
        setDiscountType('PERCENT');
        setTotalDiscountInput('');
      }
    }
  }, [orderToEdit]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

    // --- NEW: Calculations for edited order and discount validation ---
    const editedSubtotal = useMemo(() => {
      return items.reduce((sum, item) => sum + item.quantity * item.soldAt, 0);
    }, [items]);
  
    const maxAllowedDiscount = useMemo(() => {
      const totalFloorPrice = items.reduce((sum, item) => sum + (item.product?.floorPrice || 0) * item.quantity, 0);
      return editedSubtotal - totalFloorPrice;
    }, [items, editedSubtotal]);
  
    const finalTotalDiscount = useMemo(() => {
      const value = parseFloat(totalDiscountInput);
      if (isNaN(value) || value < 0) return 0;
      const calculatedDiscount = discountType === 'PERCENT' ? (editedSubtotal * value) / 100 : value;
      return Math.floor(calculatedDiscount);
    }, [totalDiscountInput, discountType, editedSubtotal]);
  
    const finalTotalAmount = useMemo(() => {
      return Math.ceil(editedSubtotal - finalTotalDiscount);
    }, [editedSubtotal, finalTotalDiscount]);
  
    const handleSave = async () => {
      if (!orderToEdit) return;
      setIsSubmitting(true);
      
      // Filter out items with quantity 0 to remove them
      const updatedItems = items.filter(item => item.quantity > 0);
  
      try {
        // Send the new discount info to our upgraded API
        const res = await fetch(`/api/orders/${orderToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updatedItems, totalDiscountInput, discountType }),
        });
  
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to update order');
        }
  
        alert('Order updated successfully!');
        onSave();
        onClose();
      } catch (error) {
        console.error('Error updating order:', error);
        alert(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    const quickDiscountPercentages = [5, 10, 15, 20];

    if (!isOpen || !orderToEdit) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Edit Order #{orderToEdit?.orderId}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-semibold flex-grow">{item.productName}</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                                disabled={isSubmitting}
                            >
                                <Minus size={16} />
                            </button>
                            
                            <div className="bg-white border border-gray-300 rounded-lg px-3 py-1 min-w-[3rem] text-center">
                                <span className="font-semibold text-gray-800">{item.quantity}</span>
                            </div>
                            
                            <button 
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                                disabled={isSubmitting}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* --- NEW: Discount Section --- */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Total Bill Discount</label>
                        <div className="flex">
                          <input type="number" value={totalDiscountInput} onChange={(e) => setTotalDiscountInput(e.target.value)} className="w-full p-2 border rounded-l-md text-sm" placeholder="e.g., 10"/>
                          <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENT' | 'FIXED')} className="p-2 border-t border-b border-r rounded-r-md bg-gray-100 text-sm">
                            <option value="PERCENT">%</option>
                            <option value="FIXED">₹</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ShieldCheck size={14} className="text-blue-500"/>
                          <span>Max possible discount: <strong>₹{maxAllowedDiscount.toFixed(2)}</strong></span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          {quickDiscountPercentages.map(perc => {
                              const discountAmount = (editedSubtotal * perc) / 100;
                              const isDisabled = discountAmount > maxAllowedDiscount;
                              return (
                                  <button key={perc} onClick={() => { setDiscountType('PERCENT'); setTotalDiscountInput(String(perc)); }} disabled={isDisabled} className="flex-1 text-xs bg-blue-50 text-blue-700 rounded-full py-1 px-2 border hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                      {perc}%
                                  </button>
                              )
                          })}
                        </div>
                      </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 p-6 border-t bg-gray-50">
                  <div className="text-right">
                      <div className="text-sm text-gray-600">New Total:</div>
                      <div className="text-2xl font-bold text-brand-text">₹{finalTotalAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={onClose} 
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={isSubmitting}
                      className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                    </button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}