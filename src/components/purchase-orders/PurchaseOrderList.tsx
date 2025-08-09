// src/components/purchase-orders/PurchaseOrderList.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, AlertCircle, Hash } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import PasswordConfirmationModal from '@/components/PasswordConfirmationModal'; // NEW: Import
import SuccessModal from '@/components/SuccessModal';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import PurchaseOrderDetailModal from './PurchaseOrderDetailModal';

async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch('/api/purchase-orders');
  if (!res.ok) throw new Error('Failed to fetch purchase orders');
  return res.json();
}

async function deletePurchaseOrder(orderId: string): Promise<void> {
  const res = await fetch(`/api/purchase-orders/${orderId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete purchase order');
  }
}

export default function PurchaseOrderList() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // NEW: State for first modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // NEW: State for password modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: purchaseOrders, isLoading, error } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchaseOrders'],
    queryFn: fetchPurchaseOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setIsSuccessModalOpen(true);
      setSelectedOrder(null);
    },
    onError: (error: Error) => { setErrorMessage(error.message); },
    onSettled: () => {
      setOrderToDelete(null);
      setIsPasswordModalOpen(false); // Ensure password modal closes
    },
  });

  const handleRowClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    if (window.innerWidth < 768) {
      setIsDetailModalOpen(true);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent | null, order: PurchaseOrder) => {
    e?.stopPropagation();
    setErrorMessage('');
    setOrderToDelete(order);
    setIsDeleteModalOpen(true); // Open the first confirmation modal
  };

  const handleInitialDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setIsPasswordModalOpen(true); // Open the password modal
  };

  const handleFinalDelete = async (password: string) => {
    if (!orderToDelete) return;
    try {
      // 1. Verify password
      const verifyRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.message || 'Password verification failed.');
      }
      // 2. If password is correct, proceed with deletion
      deleteMutation.mutate(orderToDelete.id);
    } catch (error) {
      // Re-throw to be caught by the password modal's error handling
      throw error;
    }
  };
  
  const isDeletable = (createdAt: string): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(createdAt).getTime()) < twentyFourHours;
  };

  if (isLoading) return <div>Loading purchase orders...</div>;
  if (error) return <div>Error fetching data: {(error as Error).message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        {errorMessage && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 flex items-center gap-2"><AlertCircle size={16} /> {errorMessage}</div>}
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader><TableRow><TableHead>PO ID</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {purchaseOrders?.map((order) => (
                <TableRow key={order.id} onClick={() => handleRowClick(order)} className={`cursor-pointer ${selectedOrder?.id === order.id ? 'bg-brand-secondary/30' : 'hover:bg-gray-50'}`}>
                  <TableCell className="font-medium">#{order.purchaseOrderId}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <button onClick={(e) => handleDeleteClick(e, order)} disabled={!isDeletable(order.createdAt) || deleteMutation.isPending} className="p-2 text-red-600 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-red-100 disabled:hover:bg-transparent" title={isDeletable(order.createdAt) ? 'Delete Order' : 'Deletion only allowed within 24 hours'}>
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="hidden md:block md:col-span-2">
        {selectedOrder ? (
            <PurchaseOrderDetail 
              order={selectedOrder} 
              onDelete={() => handleDeleteClick(null, selectedOrder)}
              isDeletable={isDeletable(selectedOrder.createdAt)}
            />
        ) : (
            <div className="bg-white h-full p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 border-dashed">
                <div className="bg-gray-100 rounded-full p-6 mb-4"><Hash size={48} className="text-gray-400" /></div>
                <h3 className="text-xl font-semibold text-gray-600">Select a Purchase Order</h3>
                <p className="text-gray-500 mt-1">Choose an order from the list to view its details.</p>
            </div>
        )}
      </div>

      <PurchaseOrderDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} order={selectedOrder} onDelete={() => selectedOrder && handleDeleteClick(null, selectedOrder)} isDeletable={selectedOrder ? isDeletable(selectedOrder.createdAt) : false}/>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleInitialDeleteConfirm} title="Confirm Deletion" message={`Are you sure you want to delete PO #${orderToDelete?.purchaseOrderId}? This will reverse the stock addition.`}/>
      
      <PasswordConfirmationModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onConfirm={handleFinalDelete} title="Confirm PO Deletion"/>
      
      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Success" message="The purchase order has been successfully deleted."/>
    </div>
  );
}