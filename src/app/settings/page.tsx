// src/app/settings/page.tsx

import { Suspense } from 'react'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import Navbar from '@/components/Navbar'
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
    return (
      <div className="min-h-screen bg-brand-background">
        <Navbar pageTitle="Account Settings" />
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">User Not Found</h2>
              <p className="text-gray-600">
                We couldn&apos;t find your account information. Please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar pageTitle="Account Settings" />

      <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-4xl">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 shadow-lg mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full transform translate-x-16 sm:translate-x-24 md:translate-x-32 -translate-y-16 sm:-translate-y-24 md:-translate-y-32" />
          <div className="relative p-4 sm:p-6 md:p-8">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              <div className="flex flex-col items-center text-center mb-4">
                {/* Profile Image */}
                <div className="relative mb-4">
                  {user.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/50">
                      <Image
                        src={user.image}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-white/50">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* User Info */}
                <div className="w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold text-gray-800 truncate">
                      {user.name || 'Account Settings'}
                    </h1>
                    <div className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                      Active
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 px-2">
                    Manage your account preferences and security settings
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95c.67.42 1.55.42 2.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 01-4-4V7a4 4 0 114 0v4" />
                      </svg>
                      <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium bg-indigo-50 rounded-lg p-2">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-center">Tap the edit icon to make changes</span>
              </div>
            </div>

            {/* Desktop/Tablet Layout */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-4 lg:gap-6 mb-4">
                {/* Profile Image */}
                <div className="relative flex-shrink-0">
                  {user.image ? (
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl ring-2 sm:ring-4 ring-white/50">
                      <Image
                        src={user.image}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl ring-2 sm:ring-4 ring-white/50">
                      <svg className="w-8 sm:w-10 h-8 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 sm:w-4 h-3 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                      {user.name || 'Account Settings'}
                    </h1>
                    <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-full border border-emerald-200 self-start">
                      Active
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-base sm:text-lg mb-2">
                    Manage your account preferences and security settings
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.95c.67.42 1.55.42 2.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 01-4-4V7a4 4 0 114 0v4" />
                      </svg>
                      <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 font-medium">
                <svg className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click the edit icon next to any field to make changes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="relative">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="relative">
                  <div className="w-8 sm:w-12 h-8 sm:h-12 border-4 border-indigo-200 rounded-full mx-auto"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-8 sm:h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading settings...</p>
              </div>
            </div>
          }>
            <SettingsForm user={user} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}