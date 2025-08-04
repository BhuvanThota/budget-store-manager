// src/app/api/purchase-orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreatePurchaseOrderData } from '@/types/purchaseOrder';

/**
 * GET /api/purchase-orders
 * Fetches all purchase orders for the user's shop.
 */
// FIX: Removed the unused request parameter entirely.
export async function GET() {
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

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { shopId: user.shopId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ message: 'Something went wrong while fetching purchase orders' }, { status: 500 });
  }
}

/**
 * POST /api/purchase-orders
 * Creates a new purchase order AND immediately updates the product inventory.
 */
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

    const data: CreatePurchaseOrderData = await request.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ message: 'Purchase order must contain at least one item' }, { status: 400 });
    }

    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantityOrdered * item.costPricePerItem), 0);

    // REFINED: Use a transaction to create the PO and update inventory atomically
    const newPurchaseOrder = await prisma.$transaction(async (tx) => {
      // 1. Create the Purchase Order
      const po = await tx.purchaseOrder.create({
        data: {
          shopId: user.shopId!,
          supplierDetails: data.supplierDetails,
          notes: data.notes,
          totalAmount,
          status: 'RECEIVED', // Set status to RECEIVED immediately
          receivedDate: new Date(), // Set received date to now
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantityOrdered: item.quantityOrdered,
              costPricePerItem: item.costPricePerItem,
              quantityReceived: item.quantityOrdered, // Mark all items as received
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Update stock and cost price for each product in the order
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const newQuantity = item.quantityOrdered;
          
          // Calculate new average cost price
          const existingTotalValue = product.costPrice * product.totalStock;
          const newItemsValue = item.costPricePerItem * newQuantity;
          const newTotalStock = product.totalStock + newQuantity;
          const newAverageCost = newTotalStock > 0 ? (existingTotalValue + newItemsValue) / newTotalStock : item.costPricePerItem;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: newQuantity },
              totalStock: { increment: newQuantity },
              costPrice: newAverageCost,
            },
          });
        }
      }

      return po;
    });

    return NextResponse.json(newPurchaseOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ message: 'Something went wrong while creating the purchase order' }, { status: 500 });
  }
}