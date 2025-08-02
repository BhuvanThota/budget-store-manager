// src/app/settings/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import SettingsForm from '@/components/SettingsForm'
import UserMenu from '@/components/UserMenu'

async function SettingsContent() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-blue-600 hover:text-blue-500"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>

            {/* Menu for smaller screens */}
            <UserMenu user={user} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-6">
            {user.image && (
              <Image
                src={user.image}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <SettingsForm user={user} />
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}