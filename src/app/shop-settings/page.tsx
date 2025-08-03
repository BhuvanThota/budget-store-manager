// src/app/shop-settings/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

import Navbar from '@/components/Navbar';
import ShopSettingsForm from '@/components/shop-settings/ShopSettingsForm';

export default async function ShopSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      createdAt: true,
      shop: {
        select: {
          name: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user || !user.shop) {
    return (
      <>
        <Navbar pageTitle="Shop Settings" />
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Shop Found</h2>
              <p className="text-gray-600">
                We couldn&apos;t find a shop associated with your account. Please contact support.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar pageTitle="Shop Settings" />
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Form Section */}
        <div className="relative">
          <ShopSettingsForm user={user} shop={user.shop} />
        </div>
      </div>
    </>
  );
}