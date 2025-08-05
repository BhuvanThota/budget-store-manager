// src/components/inventory/ProductDetail.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Boxes, Save, AlertTriangle, TrendingUp, TrendingDown, Edit3, DollarSign, Trash2 } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  onSave: () => void;
  onDelete: (productId: string) => void;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProductDetail({ product, onSave, onDelete }: ProductDetailProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [highestCostPrice, setHighestCostPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      fetch(`/api/products/${product.id}/stats`)
        .then(res => res.json())
        .then(data => {
          setHighestCostPrice(data.highestCostPrice || product.costPrice || 0);
        })
        .catch(() => {
          setHighestCostPrice(product.costPrice || 0);
        });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-secondary/30 rounded-lg flex items-center justify-center">
            <Edit3 size={18} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-text">Edit Product</h2>
            <p className="text-sm text-gray-500">Manage details, pricing, and stock levels</p>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {message && (
          <div className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.includes('successfully') ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
            {message}
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Edit3 size={16} className="text-brand-primary" />
            Product Information
          </h3>
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" 
              placeholder="Enter product name..."
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" />
            Pricing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sellPrice" className="block text-xs font-medium text-gray-600 mb-1">Sell Price (₹)</label>
              <input 
                type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice || ''} onChange={handleInputChange} 
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="highestCostPrice" className="block text-xs font-medium text-gray-600 mb-1">Highest Cost (₹)</label>
              <input 
                type="number" step="0.01" id="highestCostPrice" name="highestCostPrice" value={highestCostPrice.toFixed(2)} readOnly 
                className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" 
              />
            </div>
          </div>
          
          {profitLoss && (
            <div className={`mt-3 p-2 rounded-md text-xs flex items-center gap-2 ${profitLoss.isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {profitLoss.isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>
                {profitLoss.isProfit ? 'Profit' : 'Loss'}: 
                <span className="font-semibold"> ₹{profitLoss.value.toFixed(2)} </span>
                ({profitLoss.percentage.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Boxes size={16} className="text-purple-600" />
            Stock
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="currentStock" className="block text-xs font-medium text-gray-600 mb-1">Current</label>
              <input 
                type="number" id="currentStock" name="currentStock" value={formData.currentStock || ''} onChange={handleInputChange} 
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="totalStock" className="block text-xs font-medium text-gray-600 mb-1">Total</label>
              <input 
                type="number" id="totalStock" name="totalStock" value={formData.totalStock || ''} readOnly 
                className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" 
              />
            </div>
            <div>
              <label htmlFor="stockThreshold" className="block text-xs font-medium text-gray-600 mb-1">Threshold</label>
              <input 
                type="number" id="stockThreshold" name="stockThreshold" value={formData.stockThreshold || ''} onChange={handleInputChange} 
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FIX: Combined footer with both Delete and Save buttons */}
      <div className="p-4 border-t bg-gray-50 flex gap-3">
        <button
          onClick={() => product && onDelete(product.id)}
          className="w-1/3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-2/3 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>  
  );
}