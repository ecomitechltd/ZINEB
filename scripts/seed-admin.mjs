#!/usr/bin/env node
// Script to create admin user
// Usage: node scripts/seed-admin.mjs

import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@e-sim.vip'
  const password = process.env.ADMIN_PASSWORD || 'Admin123!'
  const name = process.env.ADMIN_NAME || 'Admin'

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', password: hashedPassword, name },
    })
    console.log(`User ${email} already exists, updated to ADMIN and password reset`)
    return
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      credits: 10000, // $100 starting balance
      referralCode: 'ADMIN2024',
    },
  })

  console.log('Admin user created:')
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  Role: ADMIN`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
