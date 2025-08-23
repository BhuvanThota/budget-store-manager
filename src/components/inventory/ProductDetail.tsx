// src/components/inventory/ProductDetail.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Boxes, Save, AlertTriangle, TrendingUp, TrendingDown, Edit3, DollarSign, Trash2, Tag, PlusCircle, ShieldCheck, ShoppingCart } from 'lucide-react'; // MODIFIED: Added PlusCircle

interface ProductDetailProps {
  product: Product | null;
  onSave: () => void;
  onDelete: (productId: string) => void;
  onAddPurchase: (product: Product) => void; // NEW PROP
}

// CORRECTED: This interface is essential for TypeScript to recognize floorPrice in our form data
interface EditableProduct extends Product {
  floorPrice: number;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProductDetail({ product, onSave, onDelete, onAddPurchase }: ProductDetailProps) {
  const [formData, setFormData] = useState<Partial<EditableProduct>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [highestCostPrice, setHighestCostPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // NEW: State for inline category creation
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      setCategories(await res.json());
    } catch (error) { console.error('Failed to fetch categories', error); }
  };

  useEffect(() => {
    if (product) {
      setFormData(product);
      setShowNewCategoryInput(false);
      setNewCategoryName('');

      fetchCategories();
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'categoryId' && value === 'CREATE_NEW') {
      setShowNewCategoryInput(true);
    } else {
      setShowNewCategoryInput(false);
      setFormData(prev => ({ ...prev, [name]: name === 'name' ? capitalizeFirstLetter(value) : value }));
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name cannot be empty.');
      return;
    }
    setCategoryError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const newCategory = await res.json();
      if (!res.ok) {
        throw new Error(newCategory.message || 'Failed to create category');
      }
      
      await fetchCategories();
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'An unknown error occurred.');
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
      floorPrice: parseFloat(String(formData.floorPrice)) || 0,
      currentStock: parseInt(String(formData.currentStock), 10) || 0,
      stockThreshold: parseInt(String(formData.stockThreshold), 10) || 0,
      categoryId: formData.categoryId || null,
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
  
  const sellPriceProfit = useMemo(() => {
    const sell = Number(formData.sellPrice);
    const cost = highestCostPrice;
    if (isNaN(sell) || isNaN(cost)) return null;
    const difference = sell - cost;
    const percentage = cost > 0 ? (difference / cost) * 100 : (sell > 0 ? Infinity : 0);
    return { value: difference, percentage, isProfit: difference >= 0 };
  }, [formData.sellPrice, highestCostPrice]);

  const floorPriceProfit = useMemo(() => {
    const floor = Number(formData.floorPrice);
    const cost = highestCostPrice;
    if (isNaN(floor) || isNaN(cost)) return null;
    const difference = floor - cost;
    const percentage = cost > 0 ? (difference / cost) * 100 : (floor > 0 ? Infinity : 0);
    return { value: difference, percentage, isProfit: difference >= 0 };
  }, [formData.floorPrice, highestCostPrice]);

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

        <div className="flex items-center justify-between gap-3">
          {/* Left side: Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-secondary/30 rounded-lg flex items-center justify-center">
              <Edit3 size={18} className="text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-text">Edit Product</h2>
              <p className="text-sm text-gray-500">Manage details, pricing, and stock</p>
            </div>
          </div>

          {/* Right side: Add Purchase Button */}
          <div className="flex items-center h-full gap-4">
            <div className="w-px self-stretch bg-gray-400"></div>
            <button 
              onClick={() => onAddPurchase(product)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
              <ShoppingCart size={16} />
              {/* Using whitespace-nowrap to prevent the text from breaking into two lines */}
              <span className="whitespace-nowrap">Add Purchase</span>
            </button>
          </div>

        </div>
      </div>
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {message && <div className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.includes('successfully') ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}{message}</div>}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-md font-semibold text-gray-800 flex items-center gap-2"><Edit3 size={16} className="text-brand-primary" />Product Information</h3>
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">Product Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="Enter product name..."/>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-xs font-medium text-gray-600 mb-1"><div className="flex items-center gap-1"><Tag size={12} /> Category</div></label>
            <select id="categoryId" name="categoryId" value={showNewCategoryInput ? 'CREATE_NEW' : formData.categoryId || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary">
              <option value="">No Category</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              <option value="CREATE_NEW" className="font-bold text-brand-primary">Create new category...</option>
            </select>
          </div>
          {showNewCategoryInput && (
            <div className="space-y-1">
              <div className="flex gap-2">
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name..." className="flex-grow p-2 text-sm border border-gray-300 rounded-md"/>
                <button type="button" onClick={handleAddNewCategory} className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-primary/90 flex items-center gap-1 text-xs"><PlusCircle size={14} />Add</button>
              </div>
              {categoryError && <p className="text-red-500 text-xs">{categoryError}</p>}
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2"><DollarSign size={16} className="text-green-600" />Pricing</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* UPDATED: This now correctly links to formData.costPrice and is editable */}
            <div>
              <label htmlFor="sellPrice" className="block text-xs font-medium text-gray-600 mb-1">Sell Price (₹)</label>
              <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label htmlFor="costPrice" className="block text-xs font-medium text-gray-600 mb-1">Highest Cost Price (₹)</label>
              <input type="number" step="0.01" id="costPrice" name="costPrice" value={highestCostPrice || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md"/>
            </div>
          </div>
          {sellPriceProfit && (<div className={`mt-3 p-2 rounded-md text-xs flex items-center gap-2 ${sellPriceProfit.isProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> {sellPriceProfit.isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />} <span>Margin: <span className="font-semibold">₹{sellPriceProfit.value.toFixed(2)}</span> ({sellPriceProfit.percentage.toFixed(0)}%)</span></div>)}
          
          <div className="mt-4">
            <label htmlFor="floorPrice" className="block text-xs font-medium text-gray-600 mb-1">Floor Price (₹)</label>
            <input type="number" step="0.01" id="floorPrice" name="floorPrice" value={formData.floorPrice || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md"/>
            <p className="text-xs text-gray-500 mt-1 italic">The minimum price after discounts. Manually edit to override the auto-calculated value.</p>
          </div>
          {floorPriceProfit && (<div className={`mt-3 p-2 rounded-md text-xs flex items-center gap-2 ${floorPriceProfit.isProfit ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}><ShieldCheck size={14} /><span>Guaranteed Profit: <span className="font-semibold">₹{floorPriceProfit.value.toFixed(2)}</span> ({floorPriceProfit.percentage.toFixed(0)}%)</span></div>)}
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2"><Boxes size={16} className="text-purple-600" />Stock</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="currentStock" className="block text-xs font-medium text-gray-600 mb-1">Current</label>
              <input type="number" id="currentStock" name="currentStock" value={formData.currentStock || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="0"/>
            </div>
            <div>
              <label htmlFor="totalStock" className="block text-xs font-medium text-gray-600 mb-1">Total</label>
              <input type="number" id="totalStock" name="totalStock" value={formData.totalStock || ''} readOnly className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="stockThreshold" className="block text-xs font-medium text-gray-600 mb-1">Threshold</label>
              <input type="number" id="stockThreshold" name="stockThreshold" value={formData.stockThreshold || ''} onChange={handleInputChange} className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" placeholder="10"/>
            </div>
          </div>
        </div>
      </div>
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