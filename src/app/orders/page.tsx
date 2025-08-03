// src/app/orders/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ClipboardList, Trash2, Edit } from 'lucide-react';
import { Order } from '@/types/order';
import EditOrderModal from '@/components/EditOrderModal';
import OrderDetail from '@/components/OrderDetail';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // This effect now fetches data whenever the currentPage changes
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);
  
  const fetchOrders = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=25`);
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      
      // Select the first order by default on desktop view
      if (page === 1 && window.innerWidth >= 768 && data.orders.length > 0) {
        setSelectedOrder(data.orders[0]);
      } else if (data.orders.length === 0) {
        setSelectedOrder(null);
      }
      
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    if (window.innerWidth < 768) {
      setIsMobileDetailOpen(true);
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsMobileDetailOpen(false);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsMobileDetailOpen(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  const confirmDelete = async () => {
    if (!selectedOrder) return;
    try {
      await fetch(`/api/orders/${selectedOrder.id}`, { method: 'DELETE' });
      alert(`Order #${selectedOrder.orderId} deleted successfully.`);
      setSelectedOrder(null);
      fetchOrders(currentPage); // Refetch the current page
    } catch (error) {
      console.error('Failed to delete order', error);
    } finally {
      closeDeleteModal();
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="text-center py-10 flex items-center justify-center h-[calc(100vh-80px)]">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && orders.length === 0) {
    return (
      <div className="text-center py-10 flex items-center justify-center h-[calc(100vh-80px)]">
        <div>
            <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <ClipboardList size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700">No Orders Found</h2>
            <p className="text-gray-500 mt-2">When you make a sale, it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto p-4 md:p-6 max-w-[1000px] h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Left Column: Orders List */}
          <div className="flex flex-col h-full md:pr-2">
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
              {/* Mobile List View */}
              <div className="md:hidden space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start border-b pb-3 mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-brand-primary">Order #{order.orderId}</h3>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="font-bold text-xl text-gray-800">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                    <ul className="space-y-1 mb-4">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm text-gray-700">
                          <span>{item.productName} &times; <span className="font-semibold">{item.quantity}</span></span>
                          <span>₹{(item.quantity * item.soldAt).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-end gap-3 mt-2 border-t pt-3">
                        <button onClick={() => handleEditClick(order)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1">
                            <Edit size={12} /> EDIT
                        </button>
                        <button onClick={() => handleDeleteClick(order)} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                            <Trash2 size={12} /> DELETE
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop List View */}
              <div className="hidden md:block space-y-4">
                 {orders.map((order) => (
                    <button
                        key={order.id}
                        onClick={() => handleOrderSelect(order)}
                        className={`w-full text-left bg-white p-4 rounded-lg shadow-md transition-all duration-200 border-2 ${
                            selectedOrder?.id === order.id ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-transparent hover:border-brand-primary'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-md text-brand-primary">Order #{order.orderId}</h3>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="font-bold text-lg text-gray-800">₹{order.totalAmount.toFixed(2)}</div>
                        </div>
                    </button>
                ))}
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md disabled:opacity-50">
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md disabled:opacity-50">
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Details (Desktop Only) */}
          <div className="hidden md:block h-full">
              <OrderDetail order={selectedOrder} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {(isEditModalOpen || isDeleteModalOpen || isMobileDetailOpen) && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm z-40"></div>
      )}

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={() => fetchOrders(currentPage)}
        orderToEdit={selectedOrder}
      />
      
      {isDeleteModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div ref={deleteModalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Are you sure you want to delete Order #{selectedOrder.orderId}?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeDeleteModal} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={confirmDelete} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only Order Detail Modal */}
      {isMobileDetailOpen && selectedOrder && (
         <div className="fixed md:hidden inset-0 z-50 flex items-end justify-center" onClick={() => setIsMobileDetailOpen(false)}>
            <div className="relative bg-white w-full max-w-2xl h-[80vh] rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                <OrderDetail order={selectedOrder} onEdit={handleEditClick} onDelete={handleDeleteClick} isEmbedded={true} />
            </div>
         </div>
      )}
    </>
  );
}