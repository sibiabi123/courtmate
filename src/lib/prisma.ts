let PrismaClient: any;
try {
  // Use require dynamically to prevent compiler warning when module is missing
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = class MockPrismaClient {
    constructor() {}
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
  };
}

const globalForPrisma = global as unknown as { prisma: any };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
