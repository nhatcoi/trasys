import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Test database connection on startup
if (process.env.NODE_ENV === 'development') {
  const url = process.env.DATABASE_URL || ''
  const isPrismaProxy = url.startsWith('prisma://') || url.startsWith('prisma+postgres://')
  const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://')
  if (isPrismaProxy || isPostgres) {
    db.$connect()
      .then(() => {
        console.log('✅ Database connected successfully')
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error)
      })
  } else {
    console.warn('⚠️ Skipping DB connect: Invalid or missing DATABASE_URL scheme')
  }
}

// Export types for TypeScript
export type { OrgUnit, Employee, User } from '@prisma/client'