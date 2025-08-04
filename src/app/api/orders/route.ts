// src/app/api/orders/route.ts
// NEW ENDPOINT FOR PAGINATED SALES ORDERS

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
  
  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const skip = (page - 1) * limit;

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

    // Fetch one page of orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            soldAt: true,
          }
        }
      }
    });

    // Get the total count for pagination purposes
    const totalOrders = await prisma.order.count({ where: whereClause });

    return NextResponse.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error('Error fetching paginated orders:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}