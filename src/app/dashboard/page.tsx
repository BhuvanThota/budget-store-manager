import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-6">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {session.user?.name}!
              </h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>

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
                Authentication
              </h3>
              <p className="text-green-700">
                Your Google OAuth integration is working perfectly!
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