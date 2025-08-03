// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const shopName = formData.get('shopName') as string; // New field
    const currentPassword = formData.get('currentPassword') as string | null;
    const newPassword = formData.get('newPassword') as string | null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const dataToUpdate: { name?: string; password?: string } = {};

    // Update user name if provided
    if (name) {
      dataToUpdate.name = name;
    }
    
    // Update shop name if provided and user has a shop
    if (shopName && user.shopId) {
        await prisma.shop.update({
            where: { id: user.shopId },
            data: { name: shopName }
        });
    }

    // Handle password change
    if (newPassword && currentPassword && user.password) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Invalid current password' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      dataToUpdate.password = hashedPassword;
    }

    // Update user if there's anything to update
    if (Object.keys(dataToUpdate).length > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate,
        });
    }

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}