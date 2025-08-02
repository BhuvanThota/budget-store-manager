// src/app/settings/page.tsx

import { Suspense } from 'react'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import Navbar from '@/components/Navbar' // Import the new Navbar
import SettingsForm from '@/components/SettingsForm'

export default async function Settings() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true,
      createdAt: true,
    },
  })

  if (!user) {
    return null; // Or redirect
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Account Settings" />

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
              <h3 className="text-lg font-medium text-brand-text">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <SettingsForm user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}