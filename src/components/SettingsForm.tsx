// src/components/SettingsForm.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'
import { Edit, Check, X, User as UserIcon, Mail, Calendar, Shield, Key } from 'lucide-react'

interface SettingsFormProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'image' | 'createdAt'> | null
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [name, setName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    )
  }

  const handleNameUpdate = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('name', name)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Name updated successfully!')
        setIsEditingName(false)
        router.refresh()
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (err) {
      console.log(err)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('currentPassword', currentPassword)
    formData.append('newPassword', newPassword)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setIsEditingPassword(false)
        router.refresh()
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (err) {
      console.log(err)
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelNameEdit = () => {
    setName(user?.name ?? '')
    setIsEditingName(false)
  }

  const handleCancelPasswordEdit = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsEditingPassword(false)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[700px] mx-auto">
      {/* Success/Error Message */}
      {(error || success) && (
        <div className={`relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4 ${
          success 
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center ${
              success 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {success ? <Check size={14} className="sm:w-4 sm:h-4" /> : <X size={14} className="sm:w-4 sm:h-4" />}
            </div>
            <p className={`text-xs sm:text-sm font-medium ${
              success ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {success || error}
            </p>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 w-full ${
            success 
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
              : 'bg-gradient-to-r from-red-400 to-pink-400'
          }`} />
        </div>
      )}

      {/* Profile Information Card */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16" />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <UserIcon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Profile Information</h3>
              <p className="text-xs sm:text-sm text-gray-600">Manage your personal details</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-3 mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <UserIcon size={14} className="sm:w-4 sm:h-4 text-indigo-500" />
              Full Name
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                    disabled={isLoading}
                    placeholder="Enter your full name..."
                  />
                  <button
                    onClick={handleNameUpdate}
                    disabled={isLoading || !name.trim()}
                    className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Save changes"
                  >
                    <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={handleCancelNameEdit}
                    disabled={isLoading}
                    className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Cancel editing"
                  >
                    <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/60 backdrop-blur-sm border border-blue-200 rounded-lg sm:rounded-xl text-gray-800 font-medium text-sm sm:text-base">
                    {user.name || 'No name set'}
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-white/80 backdrop-blur-sm border border-indigo-200 text-indigo-600 rounded-lg sm:rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    title="Edit name"
                  >
                    <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email Section */}
          <div className="space-y-3 mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <Mail size={14} className="sm:w-4 sm:h-4 text-indigo-500" />
              Email Address
            </label>
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg sm:rounded-xl text-gray-700 font-medium flex items-center justify-between text-sm sm:text-base">
              <span className="truncate mr-2">{user.email}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full flex-shrink-0">Read-only</span>
            </div>
          </div>

          {/* Account Created Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <Calendar size={14} className="sm:w-4 sm:h-4 text-indigo-500" />
              Member Since
            </label>
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg sm:rounded-xl text-gray-700 font-medium text-sm sm:text-base">
              {formatDate(user.createdAt)}
            </div>
          </div>

          {/* Account Created Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-indigo-500" />
              Member Since
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl text-gray-700 font-medium">
              {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-red-400/10 rounded-full transform translate-x-16 -translate-y-16" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>
              <p className="text-sm text-gray-600">Manage your account security</p>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Key size={16} className="text-orange-500" />
              Password
            </label>
            
            {!isEditingPassword ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-orange-200 rounded-xl text-gray-800 font-medium">
                  ••••••••••••
                </div>
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                  title="Change password"
                >
                  <Edit size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="Current password"
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="New password (min 6 characters)"
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    <Check size={18} />
                    Update Password
                  </button>
                  <button
                    onClick={handleCancelPasswordEdit}
                    disabled={isLoading}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Cancel editing"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">Password Requirements:</h4>
                  <ul className="space-y-1 text-xs text-orange-700">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      At least 6 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword && newPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Passwords match
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <p className="text-gray-800 font-semibold">Updating settings...</p>
              <p className="text-gray-600 text-sm">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}