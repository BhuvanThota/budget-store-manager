// src/components/inventory/ProductDetailModal.tsx
'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Product } from '@/types/product';
import { X, Save, AlertTriangle, TrendingUp, TrendingDown, Boxes } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
}

export default function ProductDetailModal({ isOpen, onClose, product, onSave }: ProductDetailModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data for read-only fields
  const highestCostPrice = useMemo(() => (product ? product.costPrice : 0), [product]);
  const totalStock = useMemo(() => (product ? product.currentStock : 0), [product]);

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);
    setMessage('');
    
    const payload = {
      name: formData.name,
      sellPrice: parseFloat(String(formData.sellPrice)) || 0,
      currentStock: parseInt(String(formData.currentStock), 10) || 0,
      stockThreshold: parseInt(String(formData.stockThreshold), 10) || 0,
    };

    try {
      const res = await fetch(`/api/inventory/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save changes.');
      setMessage('Product updated successfully!');
      onSave();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage('Error saving product.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const profitLoss = useMemo(() => {
    const sell = Number(formData.sellPrice);
    const cost = Number(highestCostPrice);
    if (!sell || !cost || cost === 0) return null;

    const difference = sell - cost;
    const percentage = (difference / cost) * 100;
    
    return {
      value: difference,
      percentage: percentage,
      isProfit: difference >= 0,
    };
  }, [formData.sellPrice, highestCostPrice]);

  if (!product) return null;

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="bg-brand-primary px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Boxes size={18} />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-md font-semibold leading-6">
                          {formData.name}
                        </Dialog.Title>
                      </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {message && (
                    <div className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {message.includes('successfully') ? <TrendingUp size={14} /> : <AlertTriangle size={14} />}
                      {message}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sell Price</label>
                      <input type="number" step="0.01" name="sellPrice" value={formData.sellPrice || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
                      <input type="number" value={highestCostPrice.toFixed(2)} readOnly className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>
                  
                  {profitLoss && (
                    <div className={`p-2 rounded-md text-xs flex items-center gap-2 ${profitLoss.isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {profitLoss.isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{profitLoss.isProfit ? 'Profit' : 'Loss'}: 
                        <span className="font-semibold"> ₹{profitLoss.value.toFixed(2)}</span> ({profitLoss.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Current Stock</label>
                      <input type="number" name="currentStock" value={formData.currentStock || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Total Stock</label>
                      <input type="number" value={totalStock} readOnly className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Stock Threshold</label>
                      <input type="number" name="stockThreshold" value={formData.stockThreshold || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                  </div>
                </div>

                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">Cancel</button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={14} />
                      {isSaving ? 'Saving...' : 'Save Changes'}
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