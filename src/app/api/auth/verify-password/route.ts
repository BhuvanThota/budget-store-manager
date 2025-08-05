// src/app/api/auth/verify-password/route.ts
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

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      // This case handles users who signed up with OAuth and have no password set.
      return NextResponse.json({ message: 'Password not set for this account.' }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    // If we reach here, the password is correct.
    return NextResponse.json({ success: true, message: 'Password verified' });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}