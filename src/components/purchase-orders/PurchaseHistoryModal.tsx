// src/components/purchase-orders/PurchaseHistoryModal.tsx
'use client';

import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';
import ConfirmationModal from '@/components/ConfirmationModal';
import PasswordConfirmationModal from '@/components/PasswordConfirmationModal';
import SuccessModal from '@/components/SuccessModal';

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string | null;
}

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: history, isLoading, error } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseHistory', productId],
    queryFn: () => fetchPurchaseHistory(productId!),
    enabled: isOpen && !!productId,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseHistory', productId] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setIsSuccessModalOpen(true);
    },
    onError: (error: Error) => { setErrorMessage(error.message); },
    onSettled: () => {
      setOrderToDelete(null);
      setIsPasswordModalOpen(false);
    },
  });
  
  const handleDeleteClick = (order: PurchaseOrder) => {
    setErrorMessage('');
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };
  
  const handleInitialDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setIsPasswordModalOpen(true);
  };

  const handleFinalDelete = async (password: string) => {
    if (!orderToDelete) return;
    try {
      const verifyRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.message || 'Password verification failed.');
      }
      deleteMutation.mutate(orderToDelete.id);
    } catch (error) {
      throw error;
    }
  };

  const isDeletable = (createdAt: string | Date): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(createdAt).getTime()) < twentyFourHours;
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
            {/* ... Transition and Dialog setup ... */}
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/30" /></Transition.Child>
            <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center"><Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                <div className="flex items-center justify-between p-6 border-b"><Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">Purchase History for <span className="font-bold text-brand-primary">{productName}</span></Dialog.Title><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button></div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {errorMessage && (<div className="p-3 mb-4 text-xs text-red-800 rounded-lg bg-red-100 flex items-center gap-2"><AlertCircle size={14} /> {errorMessage}</div>)}
                  {isLoading ? (<p>Loading history...</p>) : error ? (<p className="text-red-500">Error loading history.</p>) : history?.length === 0 ? (<p>No purchase history found for this product.</p>) : (
                    <ul className="space-y-3">
                      {history?.map(po => (
                        <li key={po.id} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start gap-4">
                            <div><p className="font-semibold">PO #{po.purchaseOrderId}</p><p className="text-sm text-gray-600">Date: {new Date(po.createdAt).toLocaleDateString()}</p>{po.supplierDetails && <p className="text-sm text-gray-500">Supplier: {po.supplierDetails}</p>}</div>
                            <div className="text-right flex-shrink-0"><p className="font-semibold">₹{po.totalAmount.toFixed(2)}</p><PurchaseOrderStatusBadge status={po.status} /></div>
                            <div className="pl-2 border-l ml-2 flex items-center h-full">
                              <button onClick={() => handleDeleteClick(po)} disabled={!isDeletable(po.createdAt) || deleteMutation.isPending} className="p-2 text-red-600 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-red-100 disabled:hover:bg-transparent" title={isDeletable(po.createdAt) ? 'Delete Order' : 'Deletion only allowed within 24 hours'}><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex justify-end p-4 border-t bg-gray-50"><button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button></div>
              </Dialog.Panel>
            </Transition.Child></div></div>
        </Dialog>
      </Transition>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleInitialDeleteConfirm} title="Confirm Deletion" message={`Are you sure you want to delete Purchase Order #${orderToDelete?.purchaseOrderId}?`}/>
      <PasswordConfirmationModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onConfirm={handleFinalDelete} title="Confirm PO Deletion"/>
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Success" message="The purchase order has been successfully deleted."/>
    </>
  );
}

