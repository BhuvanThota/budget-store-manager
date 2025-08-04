// src/app/api/products/[productId]/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/[productId]/stats
 * Fetches statistics for a single product, like highest cost price.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
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

    // Find the purchase order item with the highest cost for this product
    const highestCostItem = await prisma.purchaseOrderItem.findFirst({
      where: {
        productId: productId,
        purchaseOrder: {
          shopId: user.shopId,
        },
      },
      orderBy: {
        costPricePerItem: 'desc',
      },
    });

    return NextResponse.json({
      highestCostPrice: highestCostItem?.costPricePerItem || 0,
    });
  } catch (error) {
    console.error(`Error fetching stats for product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}