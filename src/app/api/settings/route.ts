// src/app/api/settings/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get('name') as string
    const currentPassword = formData.get('currentPassword') as string | null
    const newPassword = formData.get('newPassword') as string | null

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const dataToUpdate: { name?: string; password?: string } = {}

    if (name) {
      dataToUpdate.name = name
    }

    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password!
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Invalid current password' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      dataToUpdate.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    )
  }
}