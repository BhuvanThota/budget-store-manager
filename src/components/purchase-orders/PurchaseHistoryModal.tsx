// src/components/purchase-orders/PurchaseHistoryModal.tsx
'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';
import ConfirmationModal from '@/components/ConfirmationModal';
import SuccessModal from '@/components/SuccessModal';

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string | null;
}

// Helper functions for API calls
async function fetchPurchaseHistory(productId: string): Promise<PurchaseOrder[]> {
  const res = await fetch(`/api/products/${productId}/purchase-orders`);
  if (!res.ok) throw new Error('Failed to fetch purchase history');
  return res.json();
}

async function deletePurchaseOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/purchase-orders/${orderId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete purchase order');
  }
}

export default function PurchaseHistoryModal({ isOpen, onClose, productId, productName }: PurchaseHistoryModalProps) {
  const queryClient = useQueryClient();
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: history, isLoading, error } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseHistory', productId],
    queryFn: () => fetchPurchaseHistory(productId!),
    enabled: isOpen && !!productId, // Only fetch when the modal is open and has a productId
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseHistory', productId] }); // Refetch history
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }); // Refetch the main list on the page behind
      setIsSuccessModalOpen(true);
    },
    onError: (error: Error) => {
        setErrorMessage(error.message);
    },
    onSettled: () => {
      setOrderToDelete(null);
    },
  });

  const isDeletable = (createdAt: string | Date): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const orderDate = new Date(createdAt).getTime();
    const now = Date.now();
    return (now - orderDate) < twentyFourHours;
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Purchase History for <span className="font-bold text-brand-primary">{productName}</span>
                    </Dialog.Title>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                  </div>

                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {errorMessage && (
                        <div className="p-3 mb-4 text-xs text-red-800 rounded-lg bg-red-100 flex items-center gap-2">
                            <AlertCircle size={14} /> {errorMessage}
                        </div>
                    )}
                    {isLoading ? (
                      <p>Loading history...</p>
                    ) : error ? (
                      <p className="text-red-500">Error loading history.</p>
                    ) : history?.length === 0 ? (
                      <p>No purchase history found for this product.</p>
                    ) : (
                      <ul className="space-y-3">
                        {history?.map(po => (
                          <li key={po.id} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="font-semibold">PO #{po.purchaseOrderId}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(po.createdAt).toLocaleDateString()}</p>
                                {po.supplierDetails && <p className="text-sm text-gray-500">Supplier: {po.supplierDetails}</p>}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold">₹{po.totalAmount.toFixed(2)}</p>
                                <PurchaseOrderStatusBadge status={po.status} />
                              </div>
                              {/* NEW: Conditional Delete Button */}
                              <div className="pl-2 border-l ml-2 flex items-center h-full">
                                <button
                                  onClick={() => setOrderToDelete(po)}
                                  disabled={!isDeletable(po.createdAt) || deleteMutation.isPending}
                                  className="p-2 text-red-600 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-red-100 disabled:hover:bg-transparent"
                                  title={isDeletable(po.createdAt) ? 'Delete Order' : 'Deletion only allowed within 24 hours'}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      <ConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
            if (orderToDelete) deleteMutation.mutate(orderToDelete.id);
        }}
        title="Confirm Deletion"
        message={`Are you sure you want to delete Purchase Order #${orderToDelete?.purchaseOrderId}? This will reverse the stock addition and cannot be undone.`}
      />
      
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message="The purchase order has been successfully deleted."
      />
    </>
  );
}