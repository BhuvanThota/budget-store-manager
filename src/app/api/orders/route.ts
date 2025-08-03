// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CartItem {
  id: string;
  quantity: number;
  sellPrice: number;
  costAtSale: number;
  name: string;
}

export async function POST(req: Request) {
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

    const { cartItems, totalAmount }: { cartItems: CartItem[], totalAmount: number } = await req.json();

    if (!cartItems || cartItems.length === 0 || totalAmount === undefined) {
      return NextResponse.json({ message: 'Missing required order data' }, { status: 400 });
    }

    // Use a Prisma transaction to ensure all operations succeed or none do.
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create the Order record
      const order = await tx.order.create({
        data: {
          totalAmount,
          shopId: user.shopId!,
          items: {
            create: cartItems.map(item => ({
              productId: item.id,
              productName: item.name,
              quantity: item.quantity,
              soldAt: item.sellPrice,
              costAtSale: item.costAtSale,
            })),
          },
        },
      });

      // 2. Update the stock for each product sold
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