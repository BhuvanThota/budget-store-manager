// src/components/inventory/ProductDetail.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Boxes, Save, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface ProductDetailProps {
  product: Product | null;
  onSave: () => void;
}

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
        });
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
      sellPrice: parseFloat(String(formData.sellPrice)),
      currentStock: parseInt(String(formData.currentStock), 10),
      stockThreshold: parseInt(String(formData.stockThreshold), 10),
      costPrice: parseFloat(String(formData.costPrice)),
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
    } catch (error) {
      setMessage('Error saving product.');
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
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-brand-primary">{formData.name}</h2>
        <p className="text-sm text-gray-500">Manage pricing and stock levels.</p>
      </div>

      <div className="flex-grow p-6 space-y-4 overflow-y-auto">
        {message && (
          <div className={`p-3 rounded-md text-sm ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700">Sell Price (₹)</label>
                <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="highestCostPrice" className="block text-sm font-medium text-gray-700">Highest Cost Price (₹)</label>
                <input type="number" step="0.01" id="highestCostPrice" name="highestCostPrice" value={highestCostPrice.toFixed(2)} readOnly className="mt-1 w-full p-2 border rounded-md bg-gray-100" />
            </div>
        </div>
        
        {/* REFINED: Profit/Loss Display */}
        {profitLoss && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${profitLoss.isProfit ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {profitLoss.isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>
                    {profitLoss.isProfit ? 'Profit' : 'Loss'}: 
                    <span className="font-bold"> ₹{profitLoss.value.toFixed(2)} </span>
                    ({profitLoss.percentage.toFixed(1)}%)
                </span>
            </div>
        )}

        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
                <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        Adjust <span className="font-semibold">Current Stock</span> for manual changes. Use Purchase Orders to add new stock.
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">Current Stock</label>
                <input type="number" id="currentStock" name="currentStock" value={formData.currentStock || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700">Total Stock (from purchases)</label>
                <input type="number" id="totalStock" name="totalStock" value={formData.totalStock || ''} readOnly className="mt-1 w-full p-2 border rounded-md bg-gray-100" />
            </div>
            <div>
                <label htmlFor="stockThreshold" className="block text-sm font-medium text-gray-700">Stock Threshold</label>
                <input type="number" id="stockThreshold" name="stockThreshold" value={formData.stockThreshold || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
            </div>
        </div>
      </div>

      <div className="p-6 border-t bg-gray-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}