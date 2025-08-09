// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// This declares a global variable to hold the Prisma Client instance.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// This line is the core of the solution. It creates a new PrismaClient instance
// ONLY if one doesn't already exist on the global object.
export const prisma = globalThis.prisma || new PrismaClient();

// In development, this prevents new instances from being created during hot-reloads.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}