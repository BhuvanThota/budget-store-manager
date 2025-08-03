// src/components/shop-settings/ShopSettingsForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Shop } from '@prisma/client';

interface ShopSettingsFormProps {
  user: Pick<User, 'name'>;
  shop: Pick<Shop, 'name'>;
}

export default function ShopSettingsForm({ user, shop }: ShopSettingsFormProps) {
  const [userName, setUserName] = useState(user.name || '');
  const [shopName, setShopName] = useState(shop.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', userName);
    formData.append('shopName', shopName);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save settings');
      
      setMessage('Settings saved successfully!');
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving settings:', error);
        setMessage(error.message || 'An error occurred. Please try again.');
      } else {
        console.error('Unknown error saving settings:', error);
        setMessage('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
        <input
          type="text"
          id="shopName"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
       <div>
        <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Owner Name</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="border-t pt-4">
        <button type="submit" disabled={isSaving} className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && <p className={`mt-4 text-center text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      </div>
    </form>
  );
}