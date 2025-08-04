// src/app/api/products/[productId]/purchase-orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/[productId]/purchase-orders
 * Fetches all purchase orders containing a specific product for the user's shop.
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

    // Find all purchase order items for the given product ID, then include their parent PurchaseOrder
    const purchaseOrderItems = await prisma.purchaseOrderItem.findMany({
      where: {
        productId: productId,
        purchaseOrder: {
          shopId: user.shopId,
        },
      },
      include: {
        purchaseOrder: true, // Include the full purchase order details for each item
      },
      orderBy: {
        purchaseOrder: {
          orderDate: 'desc', // Order by the date of the purchase order
        },
      },
    });
    
    // We can extract the full PurchaseOrder objects from the result
    const purchaseOrders = purchaseOrderItems.map(item => item.purchaseOrder);

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error(`Error fetching purchase orders for product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}