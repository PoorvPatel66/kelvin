import { prisma } from './prisma.js';

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected with Prisma');
  } catch (error) {
    console.error(`PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
}
