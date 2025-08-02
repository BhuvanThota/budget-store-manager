// src/app/settings/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SignOutButton from '@/components/SignOutButton'
import SuccessMessage from '@/components/SuccessMessage'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'


async function SettingsContent() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user data with accounts
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      image: true,
      password: true,
      createdAt: true,
      accounts: {
        select: { 
          provider: true,
          createdAt: true 
        }
      }
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const hasPassword = !!user.password
  const oauthAccounts = user.accounts.filter(account => account.provider !== 'credentials')
  const hasOAuthAccounts = oauthAccounts.length > 0

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
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <SuccessMessage />
        </Suspense>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="flex items-center space-x-4">
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
                <h3 className="text-lg font-medium text-gray-900">{session.user?.name}</h3>
                <p className="text-gray-600">{session.user?.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Authentication Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sign-in Methods</h2>
            
            <div className="space-y-4">
              {/* Email & Password */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email & Password</p>
                    <p className="text-sm text-gray-500">
                      {hasPassword 
                        ? 'You can sign in with your email and password' 
                        : 'Set up email and password sign-in'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasPassword ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <Link
                      href="/auth/setup-password"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Set up
                    </Link>
                  )}
                </div>
              </div>

              {/* OAuth Accounts */}
              {oauthAccounts.map((account, index) => (
                <div key={`${account.provider}-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {account.provider === 'google' ? (
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {account.provider.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Connected {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Security Recommendation
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {hasPassword && hasOAuthAccounts
                        ? 'Great! You have multiple sign-in methods set up. This provides better security and account recovery options.'
                        : hasOAuthAccounts && !hasPassword
                        ? 'Consider setting up email & password sign-in as a backup method in case your OAuth provider is unavailable.'
                        : 'Consider adding OAuth sign-in for additional security and convenience.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
            <div className="space-y-3">
              {!hasPassword && hasOAuthAccounts && (
                <Link
                  href="/auth/setup-password"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Set up Email & Password Sign-in
                </Link>
              )}
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled
              >
                Export Account Data (Coming Soon)
              </button>
            </div>
          </div>
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