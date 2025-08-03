// src/app/api/requests/[requestId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  // Applying the fix from your guide
  context: { params: Promise<{ requestId: string }> }
) {
  // Applying the fix from your guide
  const { requestId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await prisma.request.delete({
      where: { id: requestId }, // Using the correctly awaited parameter
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting request ${requestId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}