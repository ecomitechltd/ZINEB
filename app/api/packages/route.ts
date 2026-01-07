import { NextRequest, NextResponse } from 'next/server'
import { getPackages, priceToUSD, bytesToGB, getCountryName, getCountryFlag, getRegion } from '@/lib/esim-api'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const country = searchParams.get('country')?.toUpperCase()

    const { packageList } = await getPackages({
      locationCode: country || '',
    })

    // Group packages by country and transform for frontend
    const packagesMap = new Map<string, {
      code: string
      name: string
      flag: string
      region: string
      plans: {
        id: string
        slug: string
        data: string
        days: number
        price: number
        speed: string
        dataType: number
      }[]
      lowestPrice: number
    }>()

    for (const pkg of packageList) {
      // Handle multi-country packages (regional/global)
      const locationCodes = pkg.location.split(',').map(l => l.trim())

      for (const locationCode of locationCodes) {
        // Skip regional/global markers for now, handle single countries
        if (locationCode.startsWith('!')) continue

        if (!packagesMap.has(locationCode)) {
          packagesMap.set(locationCode, {
            code: locationCode,
            name: getCountryName(locationCode),
            flag: getCountryFlag(locationCode),
            region: getRegion(locationCode),
            plans: [],
            lowestPrice: Infinity,
          })
        }

        const countryData = packagesMap.get(locationCode)!
        const priceUSD = priceToUSD(pkg.price)
        const dataGB = bytesToGB(pkg.volume)

        // Add plan if not duplicate
        const planExists = countryData.plans.some(p => p.id === pkg.packageCode)
        if (!planExists) {
          countryData.plans.push({
            id: pkg.packageCode,
            slug: pkg.slug,
            data: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
            days: pkg.duration,
            price: priceUSD,
            speed: pkg.speed,
            dataType: pkg.dataType,
          })

          if (priceUSD < countryData.lowestPrice) {
            countryData.lowestPrice = priceUSD
          }
        }
      }
    }

    // Sort plans by data amount and price
    for (const [, countryData] of packagesMap) {
      countryData.plans.sort((a, b) => {
        const aData = parseFloat(a.data)
        const bData = parseFloat(b.data)
        if (aData !== bData) return aData - bData
        return a.price - b.price
      })
    }

    // Convert to array and sort by name
    const destinations = Array.from(packagesMap.values())
      .filter(d => d.plans.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    // If specific country requested, return just that country's data
    if (country) {
      const countryData = packagesMap.get(country)
      if (!countryData) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 })
      }
      return NextResponse.json(countryData)
    }

    return NextResponse.json({
      destinations,
      total: destinations.length,
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
