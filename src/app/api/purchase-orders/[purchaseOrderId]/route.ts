// src/app/api/purchase-orders/[purchaseOrderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This is a placeholder for your existing GET or PUT functions.
// Do not remove them. Just add the new DELETE function below.

/**
 * DELETE /api/purchase-orders/[purchaseOrderId]
 *
 * Deletes a purchase order if it was created within the last 24 hours.
 * This is a critical operation that uses a transaction to ensure data integrity:
 * 1. It reverses the stock addition for each item in the order.
 * 2. It deletes the purchase order record itself.
 *
 * If any step fails, the entire operation is rolled back.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ purchaseOrderId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { purchaseOrderId } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    // First, find the purchase order to verify ownership and check its timestamp.
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
        shopId: user.shopId, // Ensures the user owns this order
      },
      include: {
        items: true, // Include the items to be reversed
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ message: 'Purchase order not found' }, { status: 404 });
    }

    // ## TIME CONSTRAINT LOGIC ##
    // Check if the order was created in the last 24 hours.
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (purchaseOrder.createdAt < twentyFourHoursAgo) {
      return NextResponse.json(
        { message: 'Deletion failed. Purchase orders can only be deleted within 24 hours of creation.' },
        { status: 403 } // 403 Forbidden is appropriate for a failed permission check
      );
    }

    // ## ATOMIC TRANSACTION ##
    // Use a transaction to ensure all or no database operations are performed.
    await prisma.$transaction(async (tx) => {
      // 1. Reverse the stock for each item in the purchase order
      for (const item of purchaseOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantityOrdered,
            },
            totalStock: {
              decrement: item.quantityOrdered,
            },
          },
        });
      }

      // 2. Delete the purchase order itself
      await tx.purchaseOrder.delete({
        where: { id: purchaseOrderId },
      });
    });

    // If the transaction is successful, return a success response.
    return new NextResponse(null, { status: 204 }); // 204 No Content is standard for a successful DELETE
  } catch (error) {
    console.error('Failed to delete purchase order:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}