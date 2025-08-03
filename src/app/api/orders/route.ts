// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ... Keep the existing POST function ...

// GET /api/orders - Fetch paginated orders for the user's shop
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  // Get page and limit from query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const skip = (page - 1) * limit;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    // Fetch a "page" of orders and the total count in parallel
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where: { shopId: user.shopId },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.order.count({
        where: { shopId: user.shopId },
      }),
    ]);
    
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}