// src/components/inventory/ManageCategoriesModal.tsx
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Tag, Edit, Trash2, Check, PlusCircle } from 'lucide-react';
import { Category } from '@/types/category';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Function to refresh categories on the parent page
}

export default function ManageCategoriesModal({ isOpen, onClose, onUpdate }: ManageCategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for creating a new category
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // State for inline editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create category');
      }
      setNewCategoryName('');
      await fetchCategories(); // Refresh list
      onUpdate(); // Refresh parent page state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) return;
    setError('');
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingCategoryName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update category');
      }
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await fetchCategories(); // Refresh list
      onUpdate(); // Refresh parent page state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      return;
    }
    setError('');
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      await fetchCategories(); // Refresh list
      onUpdate(); // Refresh parent page state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-4 border-b">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"><Tag /> Manage Categories</Dialog.Title>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
              </div>
              
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button onClick={handleAddCategory} className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-primary/90 flex items-center gap-1 text-sm"><PlusCircle size={16} /> Add</button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-2">
                {isLoading ? <p>Loading...</p> : categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
                    {editingCategoryId === cat.id ? (
                      <input 
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-grow p-1 border border-brand-primary rounded-md text-sm"
                      />
                    ) : (
                      <span className="flex-grow text-sm">{cat.name}</span>
                    )}

                    {editingCategoryId === cat.id ? (
                      <>
                        <button onClick={() => handleUpdateCategory(cat.id)} className="p-1 text-green-600 hover:text-green-800"><Check size={16} /></button>
                        <button onClick={cancelEditing} className="p-1 text-gray-500 hover:text-gray-700"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(cat)} className="p-1 text-gray-500 hover:text-gray-700"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 text-sm">Done</button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}