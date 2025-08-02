// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const exist = await prisma.user.findUnique({
      where: { email },
    })

    if (exist) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (_error) {
    console.log(_error)
    return NextResponse.json({ message: 'Something went wrong!' }, { status: 500 })
  }
}