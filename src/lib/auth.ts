// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Allow account linking by email
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // If user exists but has no password (signed up with OAuth), 
        // they need to set a password first
        if (!user.password) {
          throw new Error('Please sign in with Google or set a password first');
        }
        
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle credentials sign-in
      if (account?.provider === 'credentials') {
        // For credentials, we manually create a session
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (existingUser) {
            // Update the user ID to match the database user
            user.id = existingUser.id;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Sign-in error:', error);
          return false;
        }
      }

      // For OAuth providers, let the adapter handle it
      return true;
    },
    async session({ session, user, token }) {
      // For database sessions (OAuth)
      if (user) {
        session.user.id = user.id;
        return session;
      }

      // For JWT sessions (credentials) - fallback
      if (token?.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  session: {
    // Use database strategy for proper account linking
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
  },
  events: {
    async linkAccount({ user, account }) {
      console.log('Account linked:', { userId: user.id, provider: account.provider });
    },
  },
}