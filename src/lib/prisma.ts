// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// This declares a global variable to hold the Prisma Client instance.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// This line either creates a new PrismaClient instance or reuses the existing one from the global scope.
// The `globalThis.prisma` part is crucial for preventing new instances from being created during hot-reloads in development.
export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}