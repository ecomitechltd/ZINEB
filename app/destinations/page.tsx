import { getPackages, priceToUSD, bytesToGB, getCountryName, getCountryFlag, getRegion } from '@/lib/esim-api'
import { DestinationsClient } from './DestinationsClient'

// Popular countries (shown first in "Popular" tab)
const POPULAR_COUNTRIES = ['JP', 'US', 'TH', 'GB', 'FR', 'KR', 'DE', 'IT', 'ES', 'AU', 'SG', 'CA']

export const revalidate = 300 // Revalidate every 5 minutes

export default async function DestinationsPage() {
  try {
    const { packageList } = await getPackages()

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
        const priceUSD = priceToUSD(pkg.price)

        if (priceUSD < countryData.lowestPrice) {
          countryData.lowestPrice = priceUSD
        }
        countryData.planCount++
      }
    }

    // Convert to array and filter out invalid entries
    const destinations = Array.from(countriesMap.values())
      .filter(d => d.lowestPrice !== Infinity && d.planCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    return (
      <DestinationsClient
        destinations={destinations}
        popularCountries={POPULAR_COUNTRIES}
      />
    )
  } catch (error) {
    console.error('Error fetching destinations:', error)

    // Return empty state if API fails
    return (
      <DestinationsClient
        destinations={[]}
        popularCountries={POPULAR_COUNTRIES}
      />
    )
  }
}
