// src/components/AddEditProductModal.tsx
'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Product } from '@/types/product';

const initialFormState = {
  id: '',
  name: '',
  totalCost: '',
  initialStock: '',
  sellPrice: '',
};

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productToEdit: Product | null;
  productToRestock: Partial<Product> | null; // New prop for restocking
  allProducts: Product[];
}

export default function AddEditProductModal({ isOpen, onClose, onSave, productToEdit, productToRestock, allProducts }: AddEditProductModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const isEditing = !!productToEdit;
  const isRestocking = !!productToRestock && !productToEdit;

  useEffect(() => {
    if (productToEdit) { // Editing existing item
      setFormData({
        id: productToEdit.id,
        name: productToEdit.name,
        totalCost: String(productToEdit.totalCost),
        initialStock: String(productToEdit.initialStock),
        sellPrice: String(productToEdit.sellPrice),
      });
    } else if (productToRestock) { // Restocking (pre-filling a new item)
      setFormData({
        ...initialFormState,
        name: productToRestock.name || '',
        sellPrice: productToRestock.sellPrice ? String(productToRestock.sellPrice) : '',
      });
    } else { // Adding a completely new item
      setFormData(initialFormState);
    }
  }, [productToEdit, productToRestock, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // When restocking, it's a POST, not a PUT
    const url = isEditing ? `/api/inventory/${formData.id}` : '/api/inventory';
    const method = isEditing ? 'PUT' : 'POST';

    interface ProductPayload {
      name: string;
      totalCost: number;
      initialStock: number;
      sellPrice: number;
      currentStock?: number;
    }

    const payload: ProductPayload = {
      name: formData.name,
      totalCost: parseFloat(formData.totalCost),
      initialStock: parseInt(formData.initialStock, 10),
      sellPrice: parseFloat(formData.sellPrice),
    };
    
    // This logic now correctly handles both edits and restocks (which are just new items)
    if (isEditing) {
      const originalProduct = allProducts.find(p => p.id === formData.id);
      if (originalProduct && originalProduct.initialStock === parseInt(formData.initialStock, 10)) {
        payload.currentStock = originalProduct.currentStock;
      } else {
        payload.currentStock = parseInt(formData.initialStock, 10);
      }
    }

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save product', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formCostPerItem = parseFloat(formData.totalCost) > 0 && parseInt(formData.initialStock) > 0
    ? parseFloat(formData.totalCost) / parseInt(formData.initialStock)
    : 0;
  
  const formSellPrice = parseFloat(formData.sellPrice);
  const formProfitMargin = formCostPerItem > 0 && formSellPrice > formCostPerItem
    ? ((formSellPrice - formCostPerItem) / formCostPerItem) * 100
    : 0;
  const formLossMargin = formCostPerItem > 0 && formSellPrice < formCostPerItem
    ? ((formCostPerItem - formSellPrice) / formCostPerItem) * 100
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            {isEditing ? '✏️ Edit Product' : (isRestocking ? `📦 Restock: ${productToRestock?.name}` : '✨ Add New Product')}
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" readOnly={isRestocking}/>
          </div>
          <div>
            <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">Total Purchase Cost (₹)</label>
            <input type="number" step="0.01" id="totalCost" name="totalCost" value={formData.totalCost} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700 mb-1">Number of Items / Stock</label>
            <input type="number" id="initialStock" name="initialStock" value={formData.initialStock} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          {formCostPerItem > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-left">
              <p className="text-sm font-medium text-blue-800">
                Calculated cost per item: <span className="font-bold">₹{formCostPerItem.toFixed(2)}</span>
              </p>
            </div>
          )}
          <div>
            <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price per Item (₹)</label>
            <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          {formProfitMargin > 0 ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
              <p className="text-sm font-medium text-green-800">
                Profit Margin: <span className="font-bold">{formProfitMargin.toFixed(1)}%</span>
              </p>
            </div>
          ) : formLossMargin > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-center">
              <p className="text-sm font-medium text-red-800">
                Loss: <span className="font-bold">{formLossMargin.toFixed(1)}%</span>
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}