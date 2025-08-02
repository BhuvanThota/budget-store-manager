// src/app/auth/setup-password/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SetupPasswordForm from '@/components/SetupPasswordForm'
import Image from 'next/image'
import Link from 'next/link'

export default async function SetupPassword() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Check user's current authentication setup
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
  const hasPassword = !!user.password

  // If user already has a password, redirect to dashboard
  if (hasPassword) {
    redirect('/dashboard?message=Password already set up!')
  }

  // If user doesn't have OAuth account, they shouldn't be here
  if (!hasOAuthAccount) {
    redirect('/dashboard')
  }

  const oauthProviders = user.accounts
    .filter(account => account.provider !== 'credentials')
    .map(account => {
      const providerName = account.provider.charAt(0).toUpperCase() + account.provider.slice(1)
      return providerName
    })

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-brand-text">Almost Done!</h2>
              <p className="text-gray-500 mt-2">
                Hi <span className="font-medium text-brand-text">{session.user?.name}</span>! Add a password to enable email sign-in.
              </p>
            </div>

            {/* Provider Status */}
            <div className="mb-6 p-4 rounded-lg bg-brand-secondary">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">
                    Currently signed in with {oauthProviders.join(', ')}
                  </p>
                  <p className="text-sm text-gray-700">
                    Adding a password will give you multiple sign-in options.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <SetupPasswordForm />

            {/* Footer */}
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="text-sm text-brand-primary hover:opacity-80"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}