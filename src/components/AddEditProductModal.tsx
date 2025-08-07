// src/components/AddEditProductModal.tsx
'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { PlusCircle } from 'lucide-react';

const initialFormState = {
  id: '',
  name: '',
  costPrice: '',
  sellPrice: '',
  currentStock: '0',
  totalStock: '0',
  stockThreshold: '10',
  categoryId: '',
};

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productToEdit: Product | null;
  productToRestock: Partial<Product> | null;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function AddEditProductModal({ isOpen, onClose, onSave, productToEdit, productToRestock }: AddEditProductModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const isEditing = !!productToEdit;

  // NEW: State for inline category creation
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');


  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      if (productToEdit) {
        setFormData({
          id: productToEdit.id,
          name: productToEdit.name,
          costPrice: String(productToEdit.costPrice),
          sellPrice: String(productToEdit.sellPrice),
          currentStock: String(productToEdit.currentStock),
          totalStock: String(productToEdit.totalStock),
          stockThreshold: String(productToEdit.stockThreshold),
          categoryId: productToEdit.categoryId || '',
        });
      } else {
        setFormData({
          ...initialFormState,
          name: capitalizeFirstLetter(productToRestock?.name || ''),
        });
      }
    }
  }, [productToEdit, productToRestock, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'categoryId' && value === 'CREATE_NEW') {
      setShowNewCategoryInput(true);
    } else {
      setShowNewCategoryInput(false);
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      
      await fetchCategories(); // Refresh the list
      setFormData(prev => ({ ...prev, categoryId: newCategory.id })); // Auto-select the new category
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditing ? `/api/inventory/${formData.id}` : '/api/inventory';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      name: formData.name,
      sellPrice: parseFloat(formData.sellPrice) || 0,
      categoryId: formData.categoryId || null,
      ...(isEditing ? {
        costPrice: parseFloat(formData.costPrice) || 0,
        currentStock: parseInt(formData.currentStock, 10),
        stockThreshold: parseInt(formData.stockThreshold, 10),
      } : {
        costPrice: parseFloat(formData.costPrice) || 0
      }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
          </h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={showNewCategoryInput ? 'CREATE_NEW' : formData.categoryId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="CREATE_NEW" className="font-bold text-brand-primary">Create new category...</option>
            </select>
          </div>

          {showNewCategoryInput && (
            <div className="p-3 bg-gray-50 rounded-md border">
              <label className="block text-xs font-medium text-gray-600 mb-1">New Category Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Snacks, Drinks"
                  className="flex-grow p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-primary/90 flex items-center gap-1"
                >
                  <PlusCircle size={16} /> Add
                </button>
              </div>
              {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
            </div>
          )}

          {isEditing ? (
            <>
              <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="stockThreshold" className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
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