// src/components/SettingsForm.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'

interface SettingsFormProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'image'> | null
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [name, setName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    if (currentPassword) {
      formData.append('currentPassword', currentPassword)
    }
    if (newPassword) {
      formData.append('newPassword', newPassword)
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Profile updated successfully!')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-brand-text placeholder:text-gray-400"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-brand-text">Reset Password</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-brand-text placeholder:text-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-brand-text placeholder:text-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-brand-text placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 ring-brand-primary disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}