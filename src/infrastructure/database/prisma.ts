import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Singleton instance
let prismaInstance: PrismaClient | null = null;

/**
 * Get Prisma Client configured with D1 adapter
 * This function should only be called on the server side
 * Must be called within request context (not at build time or on client)
 */
export async function getPrisma(): Promise<PrismaClient> {
  // Return existing instance if available
  if (prismaInstance) {
    return prismaInstance;
  }

  // Only create new instance on server side
  // Check for browser environment (not Node.js or test environment)
  if (typeof window !== 'undefined' && typeof process === 'undefined') {
    throw new Error('Prisma Client cannot be used on the client side');
  }

  try {
    // Dynamic import to avoid issues with module loading
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');

    const { env } = getCloudflareContext();

    // Use D1 adapter for both development and production
    if (env.DB) {
      const adapter = new PrismaD1(env.DB);
      prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
      });

      return prismaInstance;
    }

    throw new Error('D1 database binding not found');
  } catch (error) {
    console.error('Failed to get Cloudflare context or D1 binding:', error);
    throw new Error(
      'Database configuration error. Make sure you are running with wrangler or in Cloudflare Workers environment.'
    );
  }
}

// Helper to get prisma synchronously (will throw if not initialized)
function getPrismaSync(): PrismaClient {
  if (!prismaInstance) {
    throw new Error(
      'Prisma client not initialized. Call getPrisma() first in an async context.'
    );
  }
  return prismaInstance;
}

// For backwards compatibility, but requires getPrisma() to be called first
export default {
  get company() {
    return getPrismaSync().company;
  },
  get client() {
    return getPrismaSync().client;
  },
  get invoice() {
    return getPrismaSync().invoice;
  },
  get invoiceItem() {
    return getPrismaSync().invoiceItem;
  },
  get note() {
    return getPrismaSync().note;
  },
};
