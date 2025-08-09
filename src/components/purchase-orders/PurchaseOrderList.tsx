// src/components/purchase-orders/PurchaseOrderList.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, AlertCircle } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import SuccessModal from '@/components/SuccessModal';

async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch('/api/purchase-orders');
  if (!res.ok) {
    throw new Error('Failed to fetch purchase orders');
  }
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
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
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
    },
    onError: (error: Error) => {
        setErrorMessage(error.message);
    },
    onSettled: () => {
      setOrderToDelete(null);
    },
  });

  const handleDeleteClick = (order: PurchaseOrder) => {
    setErrorMessage('');
    setOrderToDelete(order);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteMutation.mutate(orderToDelete.id);
    }
  };

  const isDeletable = (createdAt: string): boolean => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const orderDate = new Date(createdAt).getTime();
    const now = Date.now();
    return (now - orderDate) < twentyFourHours;
  };

  if (isLoading) return <div>Loading purchase orders...</div>;
  if (error) return <div>Error fetching data: {(error as Error).message}</div>;

  return (
    <>
      {errorMessage && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 flex items-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
        </div>
      )}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.purchaseOrderId}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleDeleteClick(order)}
                    disabled={!isDeletable(order.createdAt) || deleteMutation.isPending}
                    className="p-2 text-red-600 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-red-100 disabled:hover:bg-transparent"
                    title={isDeletable(order.createdAt) ? 'Delete Order' : 'Deletion only allowed within 24 hours'}
                  >
                    <Trash2 size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleConfirmDelete}
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