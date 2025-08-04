// src/components/inventory/ProductDetail.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Boxes, Save, AlertTriangle, TrendingUp, TrendingDown, Edit3 } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  onSave: () => void;
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProductDetail({ product, onSave }: ProductDetailProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [highestCostPrice, setHighestCostPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      // Fetch stats for the new product
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error saving product.');
      console.error(error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Memoized calculation for profit/loss
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

  if (!product) {
    return (
      <div className="bg-white h-full p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 border-dashed">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <Boxes size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600">Select a Product</h3>
        <p className="text-gray-500 mt-1">Choose a product from the list to view and edit its details.</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-full rounded-lg shadow-md flex flex-col">
      <div className="p-6 border-b bg-gradient-to-r from-brand-primary/5 to-indigo-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
            <Edit3 size={20} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">Edit Product</h2>
            <p className="text-sm text-gray-600">Manage product details, pricing and stock levels</p>
          </div>
        </div>
      </div>

      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.includes('successfully') ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
            {message}
          </div>
        )}
        
        {/* Product Name Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Edit3 size={18} className="text-brand-primary" />
            Product Information
          </h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleInputChange} 
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
              placeholder="Enter product name..."
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Pricing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Sell Price (₹)
              </label>
              <input 
                type="number" 
                step="0.01" 
                id="sellPrice" 
                name="sellPrice" 
                value={formData.sellPrice || ''} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="highestCostPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Highest Cost Price (₹) <span className="text-xs text-gray-500">(Read-only)</span>
              </label>
              <input 
                type="number" 
                step="0.01" 
                id="highestCostPrice" 
                name="highestCostPrice" 
                value={highestCostPrice.toFixed(2)} 
                readOnly 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" 
              />
            </div>
          </div>
          
          {/* Profit/Loss Display */}
          {profitLoss && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${profitLoss.isProfit ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {profitLoss.isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>
                {profitLoss.isProfit ? 'Profit' : 'Loss'}: 
                <span className="font-bold"> ₹{profitLoss.value.toFixed(2)} </span>
                ({profitLoss.percentage.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Stock Management Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Boxes size={18} className="text-purple-600" />
            Stock Management
          </h3>
          
          {/* Warning Message */}
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Adjust <span className="font-semibold">Current Stock</span> for manual changes. Use Purchase Orders to add new stock.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input 
                type="number" 
                id="currentStock" 
                name="currentStock" 
                value={formData.currentStock || ''} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700 mb-2">
                Total Stock <span className="text-xs text-gray-500">(From purchases)</span>
              </label>
              <input 
                type="number" 
                id="totalStock" 
                name="totalStock" 
                value={formData.totalStock || ''} 
                readOnly 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" 
              />
            </div>
            <div>
              <label htmlFor="stockThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Threshold
              </label>
              <input 
                type="number" 
                id="stockThreshold" 
                name="stockThreshold" 
                value={formData.stockThreshold || ''} 
                onChange={handleInputChange} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                placeholder="10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t bg-gray-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <Save size={16} />
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}