import { PrismaClient as PrismaClientV1 } from "../../prisma/generated/client-v1";

// Create a function to initialize PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClientV1();
};

// Declare the global type for Prisma instance
declare global {
  var prismaV1: PrismaClientV1 | undefined;
}

// Use an existing Prisma instance in development or create a new one
const prismaV1 = globalThis.prismaV1 ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaV1 = prismaV1; // Ensure the same instance is reused in development
}

export default prismaV1;
