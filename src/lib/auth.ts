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
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔍 Credentials authorize called:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('👤 User found:', { 
            exists: !!user, 
            hasPassword: !!user?.password,
            userId: user?.id 
          });

          if (!user) {
            console.log('❌ User not found');
            return null;
          }

          if (!user.password) {
            console.log('❌ User has no password');
            throw new Error('Please sign in with Google or set a password first');
          }
          
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          console.log('🔑 Password validation:', { isValid: isValidPassword });

          if (!isValidPassword) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Credentials authentication successful');
          return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
          };
        } catch (error) {
          console.error('💥 Error in authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account}) {
      console.log('🚪 signIn callback:', { 
        provider: account?.provider, 
        userId: user.id,
        email: user.email 
      });

      if (account?.provider === 'credentials') {
        console.log('🔑 Handling credentials sign-in');
        return true;
      }

      console.log('🌐 Handling OAuth sign-in');
      return true;
    },
    async session({ session, user, token }) {
      console.log('📅 Session callback:', { 
        hasUser: !!user, 
        hasToken: !!token,
        strategy: user ? 'database' : 'jwt',
        sessionUserId: session.user?.email
      });

      // For database sessions (OAuth)
      if (user) {
        console.log('📊 Using database session');
        session.user.id = user.id;
        return session;
      }

      // For JWT sessions (credentials) - this shouldn't happen with database strategy
      if (token?.sub) {
        console.log('🎫 Using JWT session fallback');
        session.user.id = token.sub;
      }

      return session;
    },
    async jwt({ token, user, account }) {
      console.log('🎫 JWT callback:', { 
        hasUser: !!user, 
        hasAccount: !!account,
        provider: account?.provider 
      });

      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 signIn event:', { 
        provider: account?.provider, 
        userId: user.id,
        isNewUser 
      });
    },
    async session({ session }) {
      console.log('📱 session event:', { userId: session.user?.email });
    },
  },
}