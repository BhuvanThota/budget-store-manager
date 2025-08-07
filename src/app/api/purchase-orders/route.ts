// src/app/api/purchase-orders/route.ts
// ENHANCED: This endpoint creates purchase orders and immediately updates inventory

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreatePurchaseOrderData } from '@/types/purchaseOrder';

/**
 * POST /api/purchase-orders
 * Creates a new purchase order and immediately updates inventory (RECEIVED status)
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
    
    // Validate the incoming data
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ message: 'At least one item is required' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = data.items.reduce(
      (sum, item) => sum + (item.quantityOrdered * item.costPricePerItem), 
      0
    );

    // Create purchase order and update inventory in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the purchase order with RECEIVED status (immediate reception)
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          supplierDetails: data.supplierDetails || null,
          totalAmount,
          status: 'RECEIVED', // Immediate reception
          notes: data.notes || null,
          receivedDate: new Date(), // Set received date immediately
          shopId: user.shopId!,
        },
      });

      // 2. Create purchase order items and update product inventory
      const purchaseOrderItems = [];
      
      for (const item of data.items) {
        // Create the purchase order item
        const poItem = await tx.purchaseOrderItem.create({
          data: {
            productName: item.productName,
            quantityOrdered: item.quantityOrdered,
            quantityReceived: item.quantityOrdered, // Immediate reception
            costPricePerItem: item.costPricePerItem,
            purchaseOrderId: purchaseOrder.id,
            productId: item.productId,
          },
        });
        
        purchaseOrderItems.push(poItem);

        // 3. Update product inventory (stock and average cost price)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          // Calculate new average cost price
          const existingTotalCost = product.costPrice * product.totalStock;
          const newItemsTotalCost = item.costPricePerItem * item.quantityOrdered;
          const newTotalStock = product.totalStock + item.quantityOrdered;
          const newAverageCost = newTotalStock > 0 
            ? (existingTotalCost + newItemsTotalCost) / newTotalStock 
            : item.costPricePerItem;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              costPrice: newAverageCost,
              totalStock: newTotalStock,
              currentStock: product.currentStock + item.quantityOrdered,
            },
          });
        }
      }

      // Return the complete purchase order with items
      return {
        ...purchaseOrder,
        items: purchaseOrderItems,
      };
    });

    console.log(`✅ Created and received Purchase Order #${result.purchaseOrderId} with ${data.items.length} items`);

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && 'code' in error) {
      const prismaError = error;
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          message: 'A purchase order with this ID already exists' 
        }, { status: 409 });
      }
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ 
          message: 'One or more products were not found' 
        }, { status: 404 });
      }
    }
    
    return NextResponse.json({ 
      message: 'Something went wrong while creating the purchase order' 
    }, { status: 500 });
  }
}

/**
 * GET /api/purchase-orders
 * Fetches all purchase orders for the authenticated user's shop.
 */
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
      include: {
        items: {
          include: {
            product: true, // Include product details for each item
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Show the most recent orders first
      },
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
