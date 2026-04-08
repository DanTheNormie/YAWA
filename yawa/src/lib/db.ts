import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


const globalForPrisma = global as unknown as { prisma: PrismaClient };

const db = globalForPrisma.prisma || new PrismaClient({adapter:new PrismaPg({connectionString: process.env.DATABASE_URL})});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;