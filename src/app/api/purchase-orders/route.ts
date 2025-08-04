// src/app/api/reports/purchases/route.ts
// This endpoint returns AGGREGATE/SUMMARY data for the purchase report.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    const whereClause = {
      shopId: user.shopId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      select: {
        totalAmount: true,
      }
    });
    
    const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalOrders = purchaseOrders.length;

    return NextResponse.json({
      totalPurchaseValue,
      totalOrders,
    });

  } catch (error) {
    console.error('Error generating purchase summary report:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}