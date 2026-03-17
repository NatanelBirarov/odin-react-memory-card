import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });

// Initialize Prisma client with direct Postgres adapter and Accelerate extension
const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

export default prisma;
