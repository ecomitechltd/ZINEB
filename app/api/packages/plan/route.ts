import { NextRequest, NextResponse } from 'next/server'
import { getPackages, priceToUSD, bytesToGB, getCountryName, getCountryFlag } from '@/lib/esim-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const packageCode = searchParams.get('packageCode')

    if (!slug && !packageCode) {
      return NextResponse.json({ error: 'slug or packageCode required' }, { status: 400 })
    }

    const { packageList } = await getPackages({
      slug: slug || '',
      packageCode: packageCode || '',
    })

    // Find the specific package
    const pkg = packageList.find(p =>
      (slug && p.slug === slug) || (packageCode && p.packageCode === packageCode)
    )

    if (!pkg) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get country from location
    const locationCode = pkg.location.split(',')[0].trim()
    const dataGB = bytesToGB(pkg.volume)

    return NextResponse.json({
      packageCode: pkg.packageCode,
      slug: pkg.slug,
      country: getCountryName(locationCode),
      countryCode: locationCode,
      flag: getCountryFlag(locationCode),
      data: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
      days: pkg.duration,
      price: priceToUSD(pkg.price),
      speed: pkg.speed,
      dataType: pkg.dataType,
    })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    )
  }
}
