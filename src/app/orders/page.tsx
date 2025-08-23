// src/app/orders/page.tsx
'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ClipboardList } from 'lucide-react';
import { Order } from '@/types/order';
import EditOrderModal from '@/components/EditOrderModal';
import OrderDetail from '@/components/OrderDetail';
import ConfirmationModal from '@/components/ConfirmationModal';

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];
type Preset = 'Today' | 'Last 7 Days' | 'This Month' | 'Last 30 Days' | null;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateForInput(d);
  });
  const [endDate, setEndDate] = useState(formatDateForInput(new Date()));
  const [activePreset, setActivePreset] = useState<Preset>('Last 30 Days');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const fetchOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?page=${page}&limit=25&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404) { setOrders([]); setTotalPages(1); setCurrentPage(1); } 
        else { throw new Error(data.message || 'Failed to fetch orders'); }
      } else {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
      
      if (window.innerWidth >= 768) {
        setSelectedOrder(prev => data.orders?.find((o: Order) => o.id === prev?.id) || data.orders?.[0] || null);
      } else {
        setSelectedOrder(null);
      }
      
    } catch (error) {
      console.error('Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  const handlePresetClick = (preset: Preset, start: Date, end: Date) => {
    setActivePreset(preset);
    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
    setCurrentPage(1);
  };

  const buttonClass = (preset: Preset) => 
    `bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition-colors text-xs ${
      activePreset === preset ? '!bg-brand-primary text-white' : ''
    }`;

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    if (window.innerWidth < 768) {
      setIsMobileDetailOpen(true);
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedOrder) return;
    await fetch(`/api/orders/${selectedOrder.id}`, { method: 'DELETE' });
    setIsDeleteModalOpen(false);
    setIsMobileDetailOpen(false); // Close detail view on successful delete
    
    if (orders.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      fetchOrders(currentPage);
    }
  };

  const handleSuccessfulSave = () => {
    fetchOrders(currentPage);
    setIsEditModalOpen(false);
    setIsMobileDetailOpen(false); // Close detail view on successful save
  };

  if (isLoading && orders.length === 0) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
    );
  }

  return (
    <>
      <div className="mx-auto p-4 md:p-6 max-w-[1200px] h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Left Column */}
          <div className="md:col-span-1 flex flex-col h-full">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex-shrink-0">
                <h3 className="font-semibold text-gray-700 mb-2">Filter Orders</h3>
                 <div className="space-y-2 mb-3">
                    <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setActivePreset(null);}} className="block w-full p-2 text-sm border border-gray-300 rounded-md" />
                    <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setActivePreset(null);}} className="block w-full p-2 text-sm border border-gray-300 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handlePresetClick('Today', new Date(), new Date())} className={buttonClass('Today')}>Today</button>
                    <button onClick={() => handlePresetClick('Last 7 Days', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())} className={buttonClass('Last 7 Days')}>Last 7 Days</button>
                    <button onClick={() => handlePresetClick('This Month', new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date())} className={buttonClass('This Month')}>This Month</button>
                    <button onClick={() => handlePresetClick('Last 30 Days', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())} className={buttonClass('Last 30 Days')}>Last 30 Days</button>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
              {!isLoading && orders.length === 0 ? (
                <div className="text-center py-10 h-full flex flex-col justify-center">
                    <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold text-gray-700">No Orders Found</h3>
                    <p className="text-gray-500 text-sm">There are no orders for this period.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <button key={order.id} onClick={() => handleOrderSelect(order)}
                      className={`w-full text-left bg-white p-3 rounded-lg shadow-sm transition-all duration-200 border-2 ${
                          selectedOrder?.id === order.id && window.innerWidth >= 768 ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-transparent hover:border-gray-300'
                      }`}>
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-sm text-brand-primary">Order #{order.orderId}</h3>
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="font-semibold text-md text-gray-800">₹{order.totalAmount.toFixed(2)}</div>
                      </div>
                  </button>
                ))
              )}
            </div>

             {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t flex-shrink-0">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">Prev</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>

          <div className="hidden h-full md:block md:col-span-2">
              <OrderDetail order={selectedOrder} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <EditOrderModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSuccessfulSave} orderToEdit={selectedOrder} />
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete Order #${selectedOrder?.orderId}? This restores stock but cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <Transition appear show={isMobileDetailOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setIsMobileDetailOpen}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="relative bg-white w-full max-w-lg h-[85vh] rounded-2xl shadow-2xl flex flex-col">
                            <OrderDetail 
                                order={selectedOrder} 
                                onEdit={handleEditClick} 
                                onDelete={handleDeleteClick} 
                                isEmbedded={true}
                                onClose={() => setIsMobileDetailOpen(false)}
                            />
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
      </Transition>
    </>
  );
}