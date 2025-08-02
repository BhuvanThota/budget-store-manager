// src/app/dashboard/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SuccessMessage from '@/components/SuccessMessage'
import Image from 'next/image'
import { Suspense } from 'react'
import UserMenu from '@/components/UserMenu'

async function DashboardContent() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Check user's authentication setup
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true,
      password: true,
      accounts: {
        select: { provider: true }
      }
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const hasOAuthAccount = user.accounts.some(account => account.provider !== 'credentials')
  const hasCredentialsAccount = user.accounts.some(account => account.provider === 'credentials')
  const hasPassword = !!user.password

  // Determine authentication status
  const authStatus = {
    hasOAuth: hasOAuthAccount,
    hasCredentials: hasCredentialsAccount,
    hasPassword: hasPassword,
    needsPasswordSetup: hasOAuthAccount && !hasPassword,
    canUseMultipleSignIn: hasOAuthAccount && hasPassword
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Menu */}
            <UserMenu user={user} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-6">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {session.user?.name}!
              </h2>
              <p className="text-gray-600">{session.user?.email}</p>
              
              {/* Authentication Status Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {authStatus.hasOAuth && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Google OAuth
                  </span>
                )}
                {authStatus.hasPassword && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Email & Password
                  </span>
                )}
                {authStatus.canUseMultipleSignIn && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Multiple Sign-in Methods
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Password Setup Prompt for OAuth-only users */}
          {authStatus.needsPasswordSetup && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Set up email & password sign-in
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You&apos;re currently signed in with Google. Add a password to enable email sign-in as a backup option.
                    </p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="/auth/setup-password"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Set up password
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Getting Started
              </h3>
              <p className="text-blue-700">
                Welcome to your new Next.js app! Start building your features here.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Authentication Status
              </h3>
              <p className="text-green-700">
                {authStatus.canUseMultipleSignIn 
                  ? 'You can sign in with both Google and email/password!' 
                  : authStatus.hasOAuth 
                    ? 'Currently using Google OAuth sign-in.' 
                    : 'Using email and password authentication.'
                }
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                Database Ready
              </h3>
              <p className="text-purple-700">
                Prisma is set up and ready for your data models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}