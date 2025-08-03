// src/app/dashboard/page.tsx
import Image from 'next/image';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

import Navbar from '@/components/Navbar';
import LowStockWarning from '@/components/dashboard/LowStockWarning';
import RestockSuggestions from '@/components/dashboard/RestockSuggestions';
import CustomerRequests from '@/components/dashboard/CustomerRequests';
import OrderChart from '@/components/dashboard/OrderChart';
import SuccessMessage from '@/components/SuccessMessage';
import PasswordSetup from '@/components/dashboard/PasswordSetup';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      shopId: true,
      name: true,
      email: true,
      image: true,
      password: true, // Needed to check if a password is set
      accounts: { select: { provider: true } } // Needed to check for OAuth accounts
    },
  });

  if (!user || !user.shopId) {
    return (
      <>
        <Navbar pageTitle="Dashboard" />
        <div className="container mx-auto p-6">
          <p>Error: Could not find a shop associated with your account.</p>
        </div>
      </>
    );
  }

  const hasOAuthAccount = user.accounts.some(account => account.provider !== 'credentials');
  const needsPasswordSetup = hasOAuthAccount && !user.password;

  const [allProducts, customerRequests, chartDataRaw] = await Promise.all([
    prisma.product.findMany({ where: { shopId: user.shopId } }),
    prisma.request.findMany({ where: { shopId: user.shopId }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({
      where: {
        shopId: user.shopId,
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      orderBy: { createdAt: 'asc' },
    })
  ]);

  const lowStockItems = allProducts
    .filter(p => p.currentStock > 0 && p.currentStock <= p.stockThreshold)
    .sort((a, b) => a.currentStock - b.currentStock);
  
  const restockItems = allProducts.filter(p => p.currentStock === 0);

  const ordersByDate = chartDataRaw.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(ordersByDate).map(([date, count]) => ({
    date,
    orders: count,
  }));

  return (
    <>
      <Navbar pageTitle="Dashboard" />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Suspense fallback={null}>
            <SuccessMessage />
        </Suspense>
        

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            {user.image && <Image src={user.image} alt="Profile" width={64} height={64} className="rounded-full" />}
            <div>
              <h2 className="text-xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
              <p className="text-gray-500">Here&apos;s a summary of your shop&apos;s status.</p>
            </div>
        </div>

        {needsPasswordSetup && <PasswordSetup />}
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderChart data={chartData} />
            <LowStockWarning items={lowStockItems} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RestockSuggestions items={restockItems} />
            <CustomerRequests initialRequests={customerRequests} />
          </div>
        </div>
      </div>
    </>
  );
}