import { getPackages, priceToUSD, getCountryName, getCountryFlag, getRegion } from '@/lib/esim-api'
import { getSettings } from '@/lib/admin'
import { CoverageClient } from './CoverageClient'

export const revalidate = 300 // Cache for 5 minutes

export const metadata = {
  title: 'Global Coverage - eSIMFly',
  description: 'Check our global eSIM coverage. Stay connected in 190+ countries with 4G/5G networks from premium carriers.',
}

// Apply markup to price
function applyMarkup(price: number, markupPercent: number): number {
  const markup = price * (markupPercent / 100)
  return Math.round((price + markup) * 100) / 100
}

async function fetchCoverageCountries() {
  const [{ packageList }, settings] = await Promise.all([
    getPackages(),
    getSettings(),
  ])

  const markupPercent = settings.markupPercent || 0

  // Group packages by country to get lowest prices
  const countriesMap = new Map<string, {
    code: string
    name: string
    flag: string
    region: string
    lowestPrice: number
  }>()

  for (const pkg of packageList) {
    const locationCodes = pkg.location.split(',').map(l => l.trim())

    for (const locationCode of locationCodes) {
      // Skip regional/global markers
      if (locationCode.startsWith('!')) continue
      if (locationCode.length !== 2) continue

      if (!countriesMap.has(locationCode)) {
        countriesMap.set(locationCode, {
          code: locationCode,
          name: getCountryName(locationCode),
          flag: getCountryFlag(locationCode),
          region: getRegion(locationCode),
          lowestPrice: Infinity,
        })
      }

      const countryData = countriesMap.get(locationCode)!
      const basePriceUSD = priceToUSD(pkg.price)
      const priceUSD = applyMarkup(basePriceUSD, markupPercent)

      if (priceUSD < countryData.lowestPrice) {
        countryData.lowestPrice = priceUSD
      }
    }
  }

  return Array.from(countriesMap.values())
    .filter(c => c.lowestPrice !== Infinity)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export default async function CoveragePage() {
  let countries: Awaited<ReturnType<typeof fetchCoverageCountries>> = []

  try {
    countries = await fetchCoverageCountries()
  } catch (error) {
    console.error('Error fetching coverage data:', error)
  }

  return <CoverageClient countries={countries} />
}
