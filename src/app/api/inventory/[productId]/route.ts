// src/app/api/inventory/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// PUT /api/inventory/[productId] - Update a product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const updateData: Prisma.ProductUpdateInput = {
        name: data.name,
        sellPrice: parseFloat(data.sellPrice),
        currentStock: parseInt(data.currentStock, 10),
        stockThreshold: parseInt(data.stockThreshold, 10),
    };
    
    const costPrice = parseFloat(data.costPrice);
    const floorPrice = parseFloat(data.floorPrice);

    if (!isNaN(costPrice)) {
        updateData.costPrice = costPrice;
        if (!isNaN(floorPrice)) {
            updateData.floorPrice = floorPrice;
        } else {
            const minimumProfit = Math.max(1, costPrice * 0.05);
            updateData.floorPrice = costPrice + minimumProfit;
        }
    } else if (!isNaN(floorPrice)) {
        updateData.floorPrice = floorPrice;
    }
    
    if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } };
    } else {
        updateData.category = { disconnect: true };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: `A product with this name already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE /api/inventory/[productId] - Delete a product
export async function DELETE(
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
    
    // --- THIS IS THE FIX ---
    // Add a guard clause to ensure the user and shopId exist before proceeding.
    if (!user || !user.shopId) {
        return NextResponse.json({ message: 'User or shop not found.' }, { status: 404 });
    }

    const product = await prisma.product.findFirst({
        where: { 
            id: productId, 
            shopId: user.shopId // Now TypeScript knows user.shopId is a string
        }
    });

    if (!product) {
        return NextResponse.json({ message: 'Product not found or you do not have permission to delete it.' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Cannot delete this product as it is already part of one or more orders. Please remove it from all orders before deleting.' }, { status: 409 });
    }
    console.error(`Error deleting product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}