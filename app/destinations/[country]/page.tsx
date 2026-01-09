import { notFound } from 'next/navigation'
import { getPackages, priceToUSD, bytesToGB, getCountryName, getCountryFlag } from '@/lib/esim-api'
import { CountryClient } from './CountryClient'

interface Props {
  params: Promise<{ country: string }>
}

// Popular destinations for "Other Destinations" section
const POPULAR_COUNTRIES = ['JP', 'US', 'TH', 'GB', 'FR', 'KR', 'DE', 'IT', 'ES', 'AU', 'SG', 'CA']

// Cache pages for 5 minutes, allows dynamic rendering
export const revalidate = 300

export async function generateMetadata({ params }: Props) {
  const { country } = await params
  const countryCode = country.toUpperCase()
  const countryName = getCountryName(countryCode)

  return {
    title: `${countryName} eSIM Plans | eSIMFly`,
    description: `Get instant mobile data in ${countryName}. Choose from multiple data plans with 4G/LTE speeds. Activate instantly.`,
  }
}

export default async function CountryDetailPage({ params }: Props) {
  const { country } = await params
  const countryCode = country.toUpperCase()

  try {
    // Fetch all packages for this country
    const { packageList } = await getPackages({ locationCode: countryCode })

    // Filter packages that include this country
    const countryPackages = packageList.filter(pkg => {
      const locations = pkg.location.split(',').map(l => l.trim())
      return locations.includes(countryCode)
    })

    if (countryPackages.length === 0) {
      notFound()
    }

    // Build country data
    const plans = countryPackages.map(pkg => {
      const dataGB = bytesToGB(pkg.volume)
      return {
        id: pkg.packageCode,
        slug: pkg.slug,
        data: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
        days: pkg.duration,
        price: priceToUSD(pkg.price),
        speed: pkg.speed,
        dataType: pkg.dataType,
      }
    }).sort((a, b) => {
      // Sort by data amount, then by price
      const aData = parseFloat(a.data)
      const bData = parseFloat(b.data)
      if (aData !== bData) return aData - bData
      return a.price - b.price
    })

    // Get network info from first package
    const firstPkg = countryPackages[0]
    const networks = firstPkg.locationNetworkList?.map(loc => ({
      locationName: loc.locationName,
      operators: loc.operatorList?.map(op => ({
        name: op.operatorName,
        type: op.networkType,
      })) || [],
    })) || []

    const countryData = {
      code: countryCode,
      name: getCountryName(countryCode),
      flag: getCountryFlag(countryCode),
      plans,
      networks,
    }

    // Fetch other popular destinations for recommendations
    const { packageList: allPackages } = await getPackages()

    const otherDestinations: { code: string; name: string; flag: string; lowestPrice: number }[] = []

    for (const popularCode of POPULAR_COUNTRIES) {
      if (popularCode === countryCode) continue

      const popularPackages = allPackages.filter(pkg => {
        const locations = pkg.location.split(',').map(l => l.trim())
        return locations.includes(popularCode)
      })

      if (popularPackages.length > 0) {
        const lowestPrice = Math.min(...popularPackages.map(p => priceToUSD(p.price)))
        otherDestinations.push({
          code: popularCode,
          name: getCountryName(popularCode),
          flag: getCountryFlag(popularCode),
          lowestPrice,
        })
      }

      if (otherDestinations.length >= 6) break
    }

    return (
      <CountryClient
        country={countryData}
        otherDestinations={otherDestinations}
      />
    )
  } catch (error) {
    console.error('Error fetching country data:', error)
    notFound()
  }
}
