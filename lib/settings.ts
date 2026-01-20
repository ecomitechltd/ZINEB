import { prisma } from '@/lib/db'
import { cache } from 'react'

export interface BusinessInfo {
  businessName: string
  businessAddress: string
  businessEmail: string
  businessPhone: string
  businessVAT: string | null
}

// Cached function to fetch business info - can be called multiple times per request
// without hitting the database multiple times
export const getBusinessInfo = cache(async (): Promise<BusinessInfo> => {
  const legacyAddress = '123 Digital Way, Tech City, TC 10001'
  const defaultAddress = '20-22 WenlockRoad , London . N1 7GU , UK'

  if (!process.env.DATABASE_URL) {
    return {
      businessName: 'VIP eSim',
      businessAddress: defaultAddress,
      businessEmail: 'support@e-sim.vip',
      businessPhone: '+1 307 223 7974',
      businessVAT: null,
    }
  }

  let settings:
    | {
        businessName: string | null
        businessAddress: string | null
        businessEmail: string | null
        businessPhone: string | null
        businessVAT: string | null
      }
    | null = null

  try {
    settings = await prisma.settings.findUnique({
      where: { id: 'default' },
      select: {
        businessName: true,
        businessAddress: true,
        businessEmail: true,
        businessPhone: true,
        businessVAT: true,
      },
    })
  } catch {
    settings = null
  }

  const resolvedAddress =
    settings?.businessAddress === legacyAddress ? defaultAddress : (settings?.businessAddress || defaultAddress)

  return {
    businessName: settings?.businessName || 'VIP eSim',
    businessAddress: resolvedAddress,
    businessEmail: settings?.businessEmail || 'support@e-sim.vip',
    businessPhone: settings?.businessPhone || '+1 307 223 7974',
    businessVAT: settings?.businessVAT || null,
  }
})
