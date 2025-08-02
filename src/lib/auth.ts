// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { Adapter } from 'next-auth/adapters';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Use adapter for OAuth and database session management
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
      if (user && account?.provider === 'credentials') {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token, user }) {
      // For database-backed sessions (OAuth)
      if (user) {
        session.user.id = user.id;
        return session;
      }
      // For JWT-based sessions (Credentials)
      if (token) {
        session.user.id = token.sub!;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },

  // Event handler for creating a shop for a new user
  events: {
    async createUser({ user }) {
      // This event triggers after a new user is created in the DB by the adapter.
      if (user.id && user.email) {
        console.log(`New user created: ${user.email}. Creating their default shop.`);
        
        try {
          // Create a default shop
          const shop = await prisma.shop.create({
            data: {
              name: `${user.name || 'My'}'s Shop`,
            },
          });

          // Update the user to link to the shop
          await prisma.user.update({
            where: { id: user.id },
            data: { shopId: shop.id },
          });

          console.log(`✅ Created shop "${shop.name}" for user ${user.email}`);
        } catch (error) {
          console.error('❌ Error creating shop for new user:', error);
        }
      }
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development', // Only debug in development
};