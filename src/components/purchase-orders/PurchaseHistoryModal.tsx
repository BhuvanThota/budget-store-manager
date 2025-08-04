// src/components/purchase-orders/PurchaseHistoryModal.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import PurchaseOrderStatusBadge from './PurchaseOrderStatusBadge';

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string | null;
}

export default function PurchaseHistoryModal({ isOpen, onClose, productId, productName }: PurchaseHistoryModalProps) {
  const [history, setHistory] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      setIsLoading(true);
      fetch(`/api/products/${productId}/purchase-orders`)
        .then(res => res.json())
        .then(data => {
          setHistory(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [isOpen, productId]);

  return (
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
                  {isLoading ? (
                    <p>Loading history...</p>
                  ) : history.length === 0 ? (
                    <p>No purchase history found for this product.</p>
                  ) : (
                    <ul className="space-y-3">
                      {history.map(po => (
                        <li key={po.id} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">PO #{po.purchaseOrderId}</p>
                              <p className="text-sm text-gray-600">Date: {new Date(po.orderDate).toLocaleDateString()}</p>
                              {po.supplierDetails && <p className="text-sm text-gray-500">Supplier: {po.supplierDetails}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{po.totalAmount.toFixed(2)}</p>
                              <PurchaseOrderStatusBadge status={po.status} />
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
  );
}