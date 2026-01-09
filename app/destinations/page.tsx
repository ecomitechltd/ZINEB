import { getPackages, priceToUSD, getCountryName, getCountryFlag, getRegion } from '@/lib/esim-api'
import { getSettings } from '@/lib/admin'
import { DestinationsClient } from './DestinationsClient'

// Popular countries (shown first in "Popular" tab)
const POPULAR_COUNTRIES = ['JP', 'US', 'TH', 'GB', 'FR', 'KR', 'DE', 'IT', 'ES', 'AU', 'SG', 'CA']

export const revalidate = 300 // Revalidate every 5 minutes

// Apply markup to price
function applyMarkup(price: number, markupPercent: number): number {
  const markup = price * (markupPercent / 100)
  return Math.round((price + markup) * 100) / 100
}

async function fetchDestinations() {
  const [{ packageList }, settings] = await Promise.all([
    getPackages(),
    getSettings(),
  ])

  const markupPercent = settings.markupPercent || 0

  // Group packages by country
  const countriesMap = new Map<string, {
    code: string
    name: string
    flag: string
    region: string
    lowestPrice: number
    planCount: number
  }>()

  for (const pkg of packageList) {
    // Handle multi-country packages
    const locationCodes = pkg.location.split(',').map(l => l.trim())

    for (const locationCode of locationCodes) {
      // Skip regional/global markers
      if (locationCode.startsWith('!')) continue
      if (locationCode.length !== 2) continue // Skip invalid codes

      if (!countriesMap.has(locationCode)) {
        countriesMap.set(locationCode, {
          code: locationCode,
          name: getCountryName(locationCode),
          flag: getCountryFlag(locationCode),
          region: getRegion(locationCode),
          lowestPrice: Infinity,
          planCount: 0,
        })
      }

      const countryData = countriesMap.get(locationCode)!
      const basePriceUSD = priceToUSD(pkg.price)
      const priceUSD = applyMarkup(basePriceUSD, markupPercent)

      if (priceUSD < countryData.lowestPrice) {
        countryData.lowestPrice = priceUSD
      }
      countryData.planCount++
    }
  }

  // Convert to array and filter out invalid entries
  return Array.from(countriesMap.values())
    .filter(d => d.lowestPrice !== Infinity && d.planCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export default async function DestinationsPage() {
  let destinations: Awaited<ReturnType<typeof fetchDestinations>> = []

  try {
    destinations = await fetchDestinations()
  } catch (error) {
    console.error('Error fetching destinations:', error)
  }

  return (
    <DestinationsClient
      destinations={destinations}
      popularCountries={POPULAR_COUNTRIES}
    />
  )
}
