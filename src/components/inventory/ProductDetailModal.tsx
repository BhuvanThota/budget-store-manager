// src/components/inventory/ProductDetailModal.tsx
'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Product } from '@/types/product';
import { X, Save, AlertTriangle, TrendingUp, TrendingDown, Boxes, Edit3 } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProductDetailModal({ isOpen, onClose, product, onSave }: ProductDetailModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [highestCostPrice, setHighestCostPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      // Fetch stats for the product
      fetch(`/api/products/${product.id}/stats`)
        .then(res => res.json())
        .then(data => {
          setHighestCostPrice(data.highestCostPrice || 0);
        })
        .catch(() => {
          // Fallback to product's costPrice if stats endpoint fails
          setHighestCostPrice(product.costPrice);
        });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Capitalize first letter for product name
    if (name === 'name') {
      setFormData(prev => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);
    setMessage('');
    
    // Include all required fields that the API expects
    const payload = {
      name: formData.name,
      costPrice: parseFloat(String(formData.costPrice)) || 0,
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
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to save changes.');
      }
      
      setMessage('Product updated successfully!');
      onSave();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage(error instanceof Error ? error.message : 'Error saving product.');
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
                {/* Header */}
                <div className="bg-brand-primary px-4 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Edit3 size={18} className="text-white" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6">
                          Edit Product
                        </Dialog.Title>
                        <p className="text-sm text-white/80">Update product details</p>
                      </div>
                    </div>
                    <button 
                      onClick={onClose} 
                      className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                      {message.includes('successfully') ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                      {message}
                    </div>
                  )}
                  
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name || ''} 
                      onChange={handleInputChange} 
                      required
                      className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                      placeholder="Enter product name..."
                    />
                  </div>

                  {/* Pricing Section */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-600" />
                      Pricing
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sell Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          name="sellPrice" 
                          value={formData.sellPrice || ''} 
                          onChange={handleInputChange} 
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" 
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
                        <input 
                          type="number" 
                          value={highestCostPrice.toFixed(2)} 
                          readOnly 
                          className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                    
                    {profitLoss && (
                      <div className={`mt-3 p-2 rounded-md text-xs flex items-center gap-2 ${profitLoss.isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {profitLoss.isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{profitLoss.isProfit ? 'Profit' : 'Loss'}: 
                          <span className="font-semibold"> ₹{profitLoss.value.toFixed(2)}</span> ({profitLoss.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stock Section */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Boxes size={16} className="text-purple-600" />
                      Stock Management
                    </h4>
                    
                    <div className="mb-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-yellow-700">
                            Adjust <span className="font-semibold">Current Stock</span> for manual changes. Use Purchase Orders to add new stock.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Stock</label>
                        <input 
                          type="number" 
                          name="currentStock" 
                          value={formData.currentStock || ''} 
                          onChange={handleInputChange} 
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" 
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Total Stock</label>
                        <input 
                          type="number" 
                          value={formData.totalStock || 0} 
                          readOnly 
                          className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" 
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Stock Threshold</label>
                        <input 
                          type="number" 
                          name="stockThreshold" 
                          value={formData.stockThreshold || ''} 
                          onChange={handleInputChange} 
                          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" 
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-4 py-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={onClose} 
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} />
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