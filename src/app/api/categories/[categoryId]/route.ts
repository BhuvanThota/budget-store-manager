// src/app/api/categories/[categoryId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/categories/[categoryId]
 * Updates a specific category's name.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
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
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }
    
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId, shopId: user.shopId }, // Ensure user owns the category
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
     if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ message: 'A category with this name already exists.' }, { status: 409 });
    }
    console.error(`Error updating category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[categoryId]
 * Deletes a specific category.
 * Note: The Prisma schema is set to `onDelete: SetNull`,
 * so products in this category will have their categoryId set to null.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
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
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id: categoryId, shopId: user.shopId }, // Ensure user owns the category
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}