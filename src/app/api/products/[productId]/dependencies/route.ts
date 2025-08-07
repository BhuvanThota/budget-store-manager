// src/app/api/products/[productId]/dependencies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { productId } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    // Check for associated sales order items
    const salesOrderItemCount = await prisma.orderItem.count({
      where: { productId: productId },
    });

    // Check for associated purchase order items
    const purchaseOrderItemCount = await prisma.purchaseOrderItem.count({
      where: { productId: productId },
    });

    const canDelete = salesOrderItemCount === 0 && purchaseOrderItemCount === 0;

    return NextResponse.json({
      canDelete,
      hasSalesOrders: salesOrderItemCount > 0,
      hasPurchaseOrders: purchaseOrderItemCount > 0,
    });
  } catch (error) {
    console.error(`Error checking dependencies for product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}