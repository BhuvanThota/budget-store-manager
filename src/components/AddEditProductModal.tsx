// src/components/AddEditProductModal.tsx
'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Product } from '@/types/product';

// REFINED: Simplified initial state for creating a new product
const initialFormState = {
  id: '',
  name: '',
  costPrice: '',
  sellPrice: '',
  currentStock: '0',
  totalStock: '0',
  stockThreshold: '10',
};

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productToEdit: Product | null;
  productToRestock: Partial<Product> | null; 
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};


export default function AddEditProductModal({ isOpen, onClose, onSave, productToEdit, productToRestock }: AddEditProductModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const isEditing = !!productToEdit;

  useEffect(() => {
    if (isOpen) {
        if (productToEdit) { // Editing existing item (keeps all fields)
          setFormData({
            id: productToEdit.id,
            name: productToEdit.name,
            costPrice: String(productToEdit.costPrice),
            sellPrice: String(productToEdit.sellPrice),
            currentStock: String(productToEdit.currentStock),
            totalStock: String(productToEdit.totalStock),
            stockThreshold: String(productToEdit.stockThreshold),
          });
        } else { // Adding a new item (uses simplified state)
          setFormData({
              ...initialFormState,
              name: capitalizeFirstLetter(productToRestock?.name || ''),
          });
        }
    }
  }, [productToEdit, productToRestock, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Capitalize first letter for product name
    if (name === 'name') {
      setFormData((prev) => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing ? `/api/inventory/${formData.id}` : '/api/inventory';
    const method = isEditing ? 'PUT' : 'POST';

    // The payload for a new product is now much simpler
    const payload = isEditing ? {
        name: formData.name,
        costPrice: parseFloat(formData.costPrice),
        sellPrice: parseFloat(formData.sellPrice),
        currentStock: parseInt(formData.currentStock, 10),
        stockThreshold: parseInt(formData.stockThreshold, 10),
    } : {
        name: formData.name,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellPrice: parseFloat(formData.sellPrice) || 0,
    };
    
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
          </div>
          
          {/* REFINED: These fields only show when editing an existing product */}
          {isEditing ? (
            <>
              <div>
                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                <input type="number" step="0.01" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input type="number" id="currentStock" name="currentStock" value={formData.currentStock} readOnly className="w-full p-2 border rounded-md bg-gray-100" />
              </div>
              <div>
                <label htmlFor="stockThreshold" className="block text-sm font-medium text-gray-700 mb-1">Stock Threshold</label>
                <input type="number" id="stockThreshold" name="stockThreshold" value={formData.stockThreshold} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </>
          ) : (
             <>
              <div>
                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Initial Cost Price (Optional)</label>
                <input type="number" step="0.01" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Initial Selling Price (Optional)</label>
                <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
             </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}