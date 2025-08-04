// src/components/purchase-orders/AddEditPurchaseOrderModal.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { X, Trash2, XIcon } from 'lucide-react';
import { PurchaseOrder, CreatePurchaseOrderData } from '@/types/purchaseOrder';
import { Product } from '@/types/product';

interface FormItem {
  productId: string;
  productName: string;
  quantityOrdered: string;
  costPricePerItem: string;
  totalCost: string;
  lastEdited: 'perItem' | 'total';
}

interface AddEditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  allProducts: Product[];
  orderToEdit: PurchaseOrder | null;
  initialProduct?: Product | null;
}

export default function AddEditPurchaseOrderModal({ isOpen, onClose, onSave, allProducts, orderToEdit, initialProduct }: AddEditPurchaseOrderModalProps) {
  const [items, setItems] = useState<FormItem[]>([]);
  const [supplierDetails, setSupplierDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!orderToEdit;

  useEffect(() => {
    if (isOpen) {
      if (orderToEdit) {
        setSupplierDetails(orderToEdit.supplierDetails || '');
        setNotes(orderToEdit.notes || '');
        setItems(orderToEdit.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantityOrdered: String(item.quantityOrdered),
          costPricePerItem: String(Math.round(item.costPricePerItem)),
          totalCost: String(item.quantityOrdered * Math.round(item.costPricePerItem)),
          lastEdited: 'perItem',
        })));
      } else if (initialProduct) {
         setItems([{
            productId: initialProduct.id,
            productName: initialProduct.name,
            quantityOrdered: '1',
            costPricePerItem: String(Math.round(initialProduct.costPrice || 0)),
            totalCost: String(Math.round(initialProduct.costPrice || 0)),
            lastEdited: 'perItem',
        }]);
        setSupplierDetails('');
        setNotes('');
      } else {
        setItems([]);
        setSupplierDetails('');
        setNotes('');
      }
    }
  }, [isOpen, orderToEdit, initialProduct]);

  const handleItemChange = (productId: string, field: keyof FormItem, value: string) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.productId === productId) {
          const newItem = { ...item, [field]: value };
          const qty = parseInt(newItem.quantityOrdered, 10) || 0;

          if (field === 'costPricePerItem' || (field === 'quantityOrdered' && newItem.lastEdited === 'perItem')) {
            const cost = parseInt(newItem.costPricePerItem, 10) || 0;
            newItem.totalCost = String(qty * cost);
            newItem.lastEdited = 'perItem';
          } else if (field === 'totalCost' || (field === 'quantityOrdered' && newItem.lastEdited === 'total')) {
            const total = parseInt(newItem.totalCost, 10) || 0;
            newItem.costPricePerItem = qty > 0 ? String(Math.round(total / qty)) : '0';
            newItem.lastEdited = 'total';
          }
          return newItem;
        }
        return item;
      })
    );
  };

    const handleAddItem = (product: Product) => {
    if (!items.some(item => item.productId === product.id)) {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantityOrdered: '1',
        costPricePerItem: String(Math.round(product.costPrice || 0)),
        totalCost: String(Math.round(product.costPrice || 0)),
        lastEdited: 'perItem',
      }]);
    }
    setSearchQuery('');
  };

  const handleRemoveItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };
  
  const overallTotalAmount = items.reduce((sum, item) => sum + Number(item.totalCost), 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload: CreatePurchaseOrderData = {
      supplierDetails,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantityOrdered: parseInt(item.quantityOrdered, 10),
        costPricePerItem: parseInt(item.costPricePerItem, 10),
      })),
    };

    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save purchase order');
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = searchQuery === ''
    ? allProducts
    : allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditing ? `Edit Purchase Order #${orderToEdit?.purchaseOrderId}` : 'Create New Purchase Order'}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.productId} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">{item.productName}</span>
                            <button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Quantity</label>
                              <input type="number" value={item.quantityOrdered} onChange={e => handleItemChange(item.productId, 'quantityOrdered', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                            </div>
                            <div className="hidden sm:block text-gray-400 pt-5"><XIcon size={16} /></div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Cost per Item (₹)</label>
                              <input type="number" value={item.costPricePerItem} onChange={e => handleItemChange(item.productId, 'costPricePerItem', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                            </div>
                            <div className="hidden sm:block text-gray-400 pt-5 font-semibold text-lg">=</div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Total Cost (₹)</label>
                              <input type="number" value={item.totalCost} onChange={e => handleItemChange(item.productId, 'totalCost', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add a product to this order</label>
                      <Combobox onChange={handleAddItem}>
                        <Combobox.Input
                          className="w-full p-2 border border-gray-300 rounded-md"
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search for an existing product..."
                        />
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg">
                          {filteredProducts.map((product) => (
                            <Combobox.Option key={product.id} value={product} className={({ active }) => `cursor-pointer select-none py-2 px-4 ${active ? 'bg-brand-primary text-white' : 'text-gray-900'}`}>
                              {product.name}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </Combobox>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Supplier Details (Optional)</label>
                      <input type="text" value={supplierDetails} onChange={e => setSupplierDetails(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                      <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 p-6 border-t bg-gray-50">
                  <div>
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold ml-2">₹{overallTotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || items.length === 0} className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-2">
                      {isSubmitting ? 'Saving...' : 'Save Purchase Order'}
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