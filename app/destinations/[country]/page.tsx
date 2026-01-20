import { notFound } from 'next/navigation'
import { getPackagesByCountryCached, getPackageDetailsCached, priceToUSD, bytesToGB, getCountryName, getCountryFlag } from '@/lib/esim-api'
import { getSettings } from '@/lib/admin'
import { POPULAR_DESTINATIONS } from '@/lib/constants'
import { CountryClient } from './CountryClient'

interface Props {
  params: Promise<{ country: string }>
}

// Cache pages for 5 minutes, allows dynamic rendering
export const revalidate = 300

// Apply markup to price
function applyMarkup(price: number, markupPercent: number): number {
  const markup = price * (markupPercent / 100)
  return Math.round((price + markup) * 100) / 100
}

export async function generateMetadata({ params }: Props) {
  const { country } = await params
  const countryCode = country.toUpperCase()
  const countryName = getCountryName(countryCode)

  return {
    title: `${countryName} eSIM Plans | VIP eSim`,
    description: `Get instant mobile data in ${countryName}. Choose from multiple data plans with 4G/LTE speeds. Activate instantly.`,
  }
}

export default async function CountryDetailPage({ params }: Props) {
  const { country } = await params
  const countryCode = country.toUpperCase()

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    notFound()
  }

  try {
    let settings: { markupPercent?: number } = { markupPercent: 0 }
    try {
      settings = await getSettings()
    } catch {
      settings = { markupPercent: 0 }
    }

    let packageListResult: Awaited<ReturnType<typeof getPackagesByCountryCached>> | null = null
    let notice: string | undefined

    try {
      packageListResult = await getPackagesByCountryCached(countryCode)
    } catch {
      notice = 'We’re having trouble loading plans right now. Please try again in a moment.'
    }

    const packageList = packageListResult?.packageList ?? []

    const markupPercent = settings.markupPercent || 0

    // Filter packages that include this country
    const countryPackages = packageList.filter(pkg => {
      const locations = pkg.location.split(',').map(l => l.trim())
      return locations.includes(countryCode)
    })

    if (!notice && countryPackages.length === 0) {
      notFound()
    }

    // Build country data
    const rawPlans = countryPackages.map(pkg => {
      const dataGB = bytesToGB(pkg.volume)
      const basePriceUSD = priceToUSD(pkg.price)
      
      const sizeStr = dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`
      const data = pkg.dataType === 2 ? `${sizeStr}/Day` : sizeStr

      return {
        id: pkg.packageCode,
        slug: pkg.slug,
        data,
        days: pkg.duration,
        price: applyMarkup(basePriceUSD, markupPercent),
        speed: pkg.speed,
        dataType: pkg.dataType,
      }
    })

    // Deduplicate plans (keep lowest price for identical specs)
    const bestPlansMap = new Map<string, typeof rawPlans[0]>()

    for (const plan of rawPlans) {
      // Key includes data (with /Day) and days.
      // We explicitly exclude speed to merge 4G/5G duplicates (preferring lower price).
      const key = `${plan.data}-${plan.days}`
      const existing = bestPlansMap.get(key)

      if (!existing || plan.price < existing.price) {
        bestPlansMap.set(key, plan)
      }
    }

    const plans = Array.from(bestPlansMap.values()).sort((a, b) => {
      // Sort by data amount (normalize to MB), then by price
      const getMB = (s: string) => {
        const val = parseFloat(s)
        return s.includes('GB') ? val * 1024 : val
      }
      const aMB = getMB(a.data)
      const bMB = getMB(b.data)
      if (aMB !== bMB) return aMB - bMB
      return a.price - b.price
    })

    // Get network info from first package
    let networks:
      | {
          locationName: string
          operators: { name: string; type: string }[]
        }[] = []

    if (countryPackages.length > 0) {
      try {
        const details = await getPackageDetailsCached(countryPackages[0].packageCode)
        networks =
          details.packageList[0]?.locationNetworkList?.map((loc) => ({
            locationName: loc.locationName,
            operators: loc.operatorList?.map((op) => ({
              name: op.operatorName,
              type: op.networkType,
            })) || [],
          })) || []
      } catch {
        notice = notice || 'We’re having trouble loading plans right now. Please try again in a moment.'
      }
    }

    const countryData = {
      code: countryCode,
      name: getCountryName(countryCode),
      flag: getCountryFlag(countryCode),
      plans,
      networks,
    }

    const otherDestinations = POPULAR_DESTINATIONS
      .filter((d) => d.code !== countryCode)
      .slice(0, 6)
      .map((d) => ({
        code: d.code,
        name: d.name,
        flag: getCountryFlag(d.code),
        lowestPrice: d.from,
      }))

    return (
      <CountryClient
        country={countryData}
        otherDestinations={otherDestinations}
        notice={notice}
      />
    )
  } catch (error) {
    console.error('Error fetching country data:', error)
    notFound()
  }
}
