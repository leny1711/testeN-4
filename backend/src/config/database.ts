/**
 * Database Configuration
 * Prisma client instance for database operations
 */

import { PrismaClient } from '@prisma/client';

// Create Prisma client instance with logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    console.warn('   Server will continue but database operations will fail.');
    console.warn('   Please check your DATABASE_URL environment variable.');
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
