// src/components/shop-settings/ShopSettingsForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Check, X, Store, CircleUser, Mail, Calendar, Sparkles } from 'lucide-react';
import type { User, Shop } from '@prisma/client';

interface ShopSettingsFormProps {
  user: Pick<User, 'name' | 'email' | 'createdAt'>;
  shop: Pick<Shop, 'name' | 'createdAt'>;
}

export default function ShopSettingsForm({ user, shop }: ShopSettingsFormProps) {
  const [userName, setUserName] = useState(user.name || '');
  const [shopName, setShopName] = useState(shop.name || '');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSaveUserName = async () => {
    setIsSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', userName);
    formData.append('shopName', shop.name);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save user name');
      
      setMessage('Owner name updated successfully!');
      setIsEditingUser(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving user name:', error);
        setMessage(error.message || 'An error occurred. Please try again.');
      } else {
        console.error('Unknown error saving user name:', error);
        setMessage('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveShopName = async () => {
    setIsSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', user.name || '');
    formData.append('shopName', shopName);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save shop name');
      
      setMessage('Shop name updated successfully!');
      setIsEditingShop(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving shop name:', error);
        setMessage(error.message || 'An error occurred. Please try again.');
      } else {
        console.error('Unknown error saving shop name:', error);
        setMessage('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelUserEdit = () => {
    setUserName(user.name || '');
    setIsEditingUser(false);
  };

  const handleCancelShopEdit = () => {
    setShopName(shop.name || '');
    setIsEditingShop(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 max-w-[600px] mx-auto">
      {/* Success/Error Message */}
      {message && (
        <div className={`relative overflow-hidden rounded-xl p-4 ${
          message.includes('successfully') 
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.includes('successfully') 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {message.includes('successfully') ? <Check size={16} /> : <X size={16} />}
            </div>
            <p className={`text-sm font-medium ${
              message.includes('successfully') ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 w-full ${
            message.includes('successfully') 
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
              : 'bg-gradient-to-r from-red-400 to-pink-400'
          }`} />
        </div>
      )}

      {/* Shop Information Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full transform translate-x-16 -translate-y-16" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Shop Information</h3>
              <p className="text-sm text-gray-600">Manage your business details</p>
            </div>
          </div>

          {/* Shop Name */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles size={16} className="text-indigo-500" />
              Shop Name
            </label>
            <div className="flex items-center gap-3">
              {isEditingShop ? (
                <>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                    disabled={isSaving}
                    placeholder="Enter shop name..."
                  />
                  <button
                    onClick={handleSaveShopName}
                    disabled={isSaving || !shopName.trim()}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Save changes"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelShopEdit}
                    disabled={isSaving}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Cancel editing"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-xl text-gray-800 font-medium">
                    {shop.name}
                  </div>
                  <button
                    onClick={() => setIsEditingShop(true)}
                    className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    title="Edit shop name"
                  >
                    <Edit size={18} />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <Calendar size={12} />
              Created: {formatDate(shop.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Information Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-red-400/10 rounded-full transform translate-x-16 -translate-y-16" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <CircleUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Owner Information</h3>
              <p className="text-sm text-gray-600">Your personal details</p>
            </div>
          </div>

          {/* Owner Name */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CircleUser size={16} className="text-orange-500" />
              Owner Name
            </label>
            <div className="flex items-center gap-3">
              {isEditingUser ? (
                <>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                    disabled={isSaving}
                    placeholder="Enter your name..."
                  />
                  <button
                    onClick={handleSaveUserName}
                    disabled={isSaving || !userName.trim()}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Save changes"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelUserEdit}
                    disabled={isSaving}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Cancel editing"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-xl text-gray-800 font-medium">
                    {user.name || 'No name set'}
                  </div>
                  <button
                    onClick={() => setIsEditingUser(true)}
                    className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    title="Edit owner name"
                  >
                    <Edit size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Mail size={16} className="text-orange-500" />
              Email Address
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center justify-between">
              <span>{user.email}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Read-only</span>
            </div>
          </div>

          {/* Account Created Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-orange-500" />
              Account Created
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
              {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">Saving changes...</p>
              <p className="text-gray-600 text-sm">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}