// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  // Use adapter for OAuth only
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            return null;
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
        } catch (error) {
          console.error('💥 Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // For credentials provider, store user info in JWT
      if (user && account?.provider === 'credentials') {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token, user }) {
      // For database sessions (OAuth users)
      if (user) {
        session.user.id = user.id;
        return session;
      }

      // For JWT sessions (credentials users)
      if (token) {
        session.user.id = token.sub!;
        // Ensure we have all user data
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }

      return session;
    },
  },
  session: {
    // CRITICAL: Use JWT strategy for credentials to work
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
}