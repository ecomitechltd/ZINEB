import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <AdminDashboard
      adminUser={{ name: user.name || 'Admin', email: user.email }}
    />
  )
}
