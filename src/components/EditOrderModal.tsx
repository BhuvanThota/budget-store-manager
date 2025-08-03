// src/components/EditOrderModal.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Minus, Plus, Save } from 'lucide-react';
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

  useEffect(() => {
    if (orderToEdit) {
      // Create a deep copy to avoid mutating the original state directly
      setItems(JSON.parse(JSON.stringify(orderToEdit.items)));
    }
  }, [orderToEdit]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return; // Prevent negative quantity
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSave = async () => {
    if (!orderToEdit) return;
    setIsSubmitting(true);
    const newTotalAmount = items.reduce((sum, item) => sum + item.quantity * item.soldAt, 0);

    // Filter out items with quantity 0 to remove them
    const updatedItems = items.filter(item => item.quantity > 0);

    try {
      const res = await fetch(`/api/orders/${orderToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedItems, newTotalAmount }),
      });

      if (!res.ok) throw new Error('Failed to update order');

      alert('Order updated successfully!');
      onSave(); // This will trigger a re-fetch in the parent component
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('An error occurred while updating the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                </div>

                <div className="flex justify-end space-x-3 mt-4 p-6 border-t bg-gray-50">
                  <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
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

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}