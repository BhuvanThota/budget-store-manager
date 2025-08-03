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
    include: {
      shop: true,
    },
  });

  if (!user || !user.shop) {
    return <div>Data could not be loaded.</div>;
  }

  return (
    <>
      <Navbar pageTitle="Shop Settings" />
      <div className="container mx-auto p-4 md:p-6 max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Shop Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Update your shop name and owner details here.
                </p>
            </div>
          <ShopSettingsForm user={user} shop={user.shop} />
        </div>
      </div>
    </>
  );
}