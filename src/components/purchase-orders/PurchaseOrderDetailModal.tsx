// src/components/purchase-orders/PurchaseOrderDetailModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import { X } from 'lucide-react';

interface PurchaseOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  onDelete: (order: PurchaseOrder) => void; // ADDED: onDelete prop
  isDeletable: boolean; // ADDED: Prop to check if deletable
}

export default function PurchaseOrderDetailModal({ isOpen, onClose, order, onDelete, isDeletable }: PurchaseOrderDetailModalProps) {
  if (!order) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-50 text-left align-middle shadow-xl transition-all">
                 <div className="flex items-center justify-between p-4 border-b bg-white">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    Purchase Order Details
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>
                <div className="p-4">
                    {/* MODIFIED: Pass the new props down */}
                    <PurchaseOrderDetail 
                      order={order} 
                      onDelete={onDelete}
                      isDeletable={isDeletable}
                    />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}