// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/types/product';

// POST /api/orders - Creates a new order
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    const { cartItems, totalAmount } = await request.json();

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Invalid order data' }, { status: 400 });
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const productIds = cartItems.map((item: CartItem) => item.id);
      const productsInDb = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const order = await tx.order.create({
        data: {
          totalAmount: totalAmount,
          shopId: user.shopId!,
          items: {
            create: cartItems.map((item: CartItem) => {
              const product = productsInDb.find(p => p.id === item.id);
              
              // FIX: Use the new `costPrice` field directly.
              const costAtSale = product ? product.costPrice : 0;
              
              return {
                quantity: item.quantity,
                soldAt: item.sellPrice,
                costAtSale: costAtSale, // Use the correct cost
                productId: item.id,
                productName: item.name,
              };
            }),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Something went wrong while creating the order' }, { status: 500 });
  }
}


// GET /api/orders - Fetches paginated AND filtered orders
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
        return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { shopId: true },
        });

        if (!user || !user.shopId) {
            return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
        }

        const whereClause = {
            shopId: user.shopId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        const [orders, totalOrders] = await prisma.$transaction([
            prisma.order.findMany({
                where: whereClause,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit,
            }),
            prisma.order.count({ where: whereClause }),
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
        return NextResponse.json({ message: 'Something went wrong while fetching orders' }, { status: 500 });
    }
}