import { prisma } from './prisma.js';

function ensureDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL.');
  }
}

export async function connectDB() {
  try {
    ensureDatabaseConfig();
    await prisma.$connect();
    console.log('PostgreSQL connected with Prisma');
  } catch (error) {
    console.error(`PostgreSQL connection failed: ${error.message}`);
    process.exit(1);
  }
}
