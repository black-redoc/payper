import { PrismaClient } from '@/generated/prisma';

let prisma: PrismaClient;

if (process.env.ENV === 'DEV') {
  // En desarrollo, usar una instancia global para evitar múltiples conexiones
  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  prisma = globalForPrisma.prisma;
} else {
  // En producción, crear una nueva instancia cada vez
  prisma = new PrismaClient();
}

export default prisma;
