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
        console.log('🔍 Credentials authorize called');
        
        if (!credentials?.email || !credentials.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('👤 User lookup result:', { 
            found: !!user, 
            hasPassword: !!user?.password 
          });

          if (!user || !user.password) {
            console.log('❌ User not found or no password');
            return null;
          }
          
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          console.log('🔑 Password check:', { valid: isValidPassword });

          if (!isValidPassword) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Credentials auth successful, returning user');
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
    async signIn({ user, account }) {
      console.log('🚪 SignIn callback:', { 
        provider: account?.provider,
        email: user.email 
      });
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('🎫 JWT callback:', { 
        hasUser: !!user,
        provider: account?.provider,
        tokenSub: token.sub
      });

      // For credentials provider, store user info in JWT
      if (user && account?.provider === 'credentials') {
        console.log('💾 Storing credentials user in JWT');
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token, user }) {
      console.log('📅 Session callback:', { 
        hasUser: !!user,
        hasToken: !!token,
        tokenSub: token?.sub,
        sessionEmail: session.user?.email
      });

      // For database sessions (OAuth users)
      if (user) {
        console.log('📊 Using database session for OAuth user');
        session.user.id = user.id;
        return session;
      }

      // For JWT sessions (credentials users)
      if (token) {
        console.log('🎫 Using JWT session for credentials user');
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
  debug: true, // Keep debug on for now
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 SignIn event:', { 
        provider: account?.provider,
        userId: user.id,
        email: user.email,
        isNewUser 
      });
    },
    async session({ session }) {
      console.log('📱 Session event:', { 
        userId: session.user?.id,
        email: session.user?.email 
      });
    },
  },
}