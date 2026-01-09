#!/usr/bin/env node
// Script to create admin user
// Usage: node scripts/seed-admin.mjs

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@esimfly.me'
  const password = 'Admin123!'
  const name = 'Admin'

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    // Update to admin
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
    console.log(`User ${email} already exists, updated to ADMIN`)
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
