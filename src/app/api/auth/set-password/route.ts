// src/app/api/auth/set-password/route.ts

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

    const { password } = await req.json()

    // Validation
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Find user with their accounts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          select: { provider: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if user already has a password
    if (user.password) {
      return NextResponse.json({ 
        message: 'Password already set. Use account settings to change your existing password.' 
      }, { status: 400 })
    }

    // Verify user has OAuth account (security check)
    const hasOAuthAccount = user.accounts.some(account => account.provider !== 'credentials')
    if (!hasOAuthAccount) {
      return NextResponse.json({ 
        message: 'Password setup is only available for OAuth users' 
      }, { status: 400 })
    }

    // Hash the password
    const saltRounds = 12 // Higher than default for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Update user with password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        accounts: {
          select: { provider: true }
        }
      }
    })

    // Log the successful password setup (for analytics/security)
    console.log(`Password set for user ${updatedUser.email} (OAuth user)`)

    return NextResponse.json({ 
      message: 'Password set successfully! You can now sign in with email and password.',
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        authMethods: updatedUser.accounts.map(account => account.provider).concat(['credentials'])
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Set password error:', error)
    
    // Don't expose internal errors to client
    return NextResponse.json({ 
      message: 'An error occurred while setting up your password. Please try again.' 
    }, { status: 500 })
  }
}

// GET endpoint to check if user can set a password
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
        accounts: {
          select: { provider: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const hasOAuthAccount = user.accounts.some(account => account.provider !== 'credentials')
    const hasPassword = !!user.password
    const canSetPassword = hasOAuthAccount && !hasPassword

    return NextResponse.json({
      canSetPassword,
      hasPassword,
      hasOAuthAccount,
      authMethods: user.accounts.map(account => account.provider),
      message: canSetPassword 
        ? 'User can set up password' 
        : hasPassword 
          ? 'Password already set' 
          : 'User must have OAuth account to set password'
    })

  } catch (error) {
    console.error('Check password setup error:', error)
    return NextResponse.json({ 
      message: 'Error checking password setup status' 
    }, { status: 500 })
  }
}