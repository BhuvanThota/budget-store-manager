// src/components/Navbar.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

import SideMenu from '@/components/SideMenu'
import UserMenu from '@/components/UserMenu'

interface NavbarProps {
  pageTitle: string;
}

export default async function Navbar({ pageTitle }: NavbarProps) {
  const session = await getServerSession(authOptions)
  
  // This navbar is only for authenticated users.
  // A redirect here ensures unauthenticated users can't even see the navbar structure.
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { 
      name: true, 
      image: true,
      email: true
    },
  })

  return (
    <div className="bg-brand-primary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Slot: Sandwich Menu */}
          <div className="flex-1 flex justify-start">
            <SideMenu />
          </div>

          {/* Center Slot: Page Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          </div>

          {/* Right Slot: User Menu */}
          <div className="flex-1 flex justify-end">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}