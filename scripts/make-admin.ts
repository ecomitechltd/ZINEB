// Script to make a user an admin
// Usage: npx tsx scripts/make-admin.ts <email>

import { prisma } from '../lib/db'

async function main() {
  const email = process.argv[2]

  if (!email) {
    // If no email provided, list users and make first one admin
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
      take: 10,
    })

    console.log('Users in database:')
    users.forEach((u: { email: string; role: string }) => console.log(`  - ${u.email} (${u.role})`))

    if (users.length > 0) {
      const firstUser = users[0]
      const updated = await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: 'ADMIN' },
      })
      console.log(`\nMade ${updated.email} an ADMIN`)
    }
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })

  console.log(`Successfully made ${updated.email} an admin`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
