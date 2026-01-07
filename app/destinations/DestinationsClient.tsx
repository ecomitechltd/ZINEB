'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Search, MapPin, Globe2, Plane, TrendingUp, X } from 'lucide-react'

interface Destination {
  code: string
  name: string
  flag: string
  region: string
  lowestPrice: number
  planCount: number
}

interface DestinationsClientProps {
  destinations: Destination[]
  popularCountries: string[]
}

const regions = [
  { id: 'popular', label: 'Popular', icon: TrendingUp },
  { id: 'Europe', label: 'Europe', icon: Globe2 },
  { id: 'Asia', label: 'Asia', icon: Plane },
  { id: 'Americas', label: 'Americas', icon: MapPin },
  { id: 'Oceania', label: 'Oceania', icon: Globe2 },
  { id: 'Middle East', label: 'Middle East', icon: MapPin },
  { id: 'Africa', label: 'Africa', icon: Globe2 },
]

export function DestinationsClient({ destinations, popularCountries }: DestinationsClientProps) {
  const [activeRegion, setActiveRegion] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Group destinations by region
  const destinationsByRegion = useMemo(() => {
    const grouped: Record<string, Destination[]> = {
      popular: destinations.filter(d => popularCountries.includes(d.code)),
    }

    for (const dest of destinations) {
      if (!grouped[dest.region]) {
        grouped[dest.region] = []
      }
      grouped[dest.region].push(dest)
    }

    // Sort each region alphabetically
    for (const region of Object.keys(grouped)) {
      grouped[region].sort((a, b) => a.name.localeCompare(b.name))
    }

    return grouped
  }, [destinations, popularCountries])

  // Filter destinations based on search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) {
      return destinationsByRegion[activeRegion] || []
    }
    const query = searchQuery.toLowerCase()
    return destinations.filter(
      c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
    )
  }, [searchQuery, activeRegion, destinations, destinationsByRegion])

  const currentDestinations = searchQuery ? filteredDestinations : (destinationsByRegion[activeRegion] || [])

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full" />

          <div className="container mx-auto px-6 py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Find Your Destination
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Browse eSIM plans for {destinations.length}+ countries. Instant activation, great rates.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsSearching(e.target.value.length > 0)
                    }}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white text-gray-900 text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setIsSearching(false)
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Region Tabs */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setActiveRegion(region.id)
                    setSearchQuery('')
                    setIsSearching(false)
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    activeRegion === region.id && !isSearching
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <region.icon className="w-4 h-4" />
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            {isSearching && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 mb-6"
              >
                {filteredDestinations.length} {filteredDestinations.length === 1 ? 'result' : 'results'} found
              </motion.p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion + searchQuery}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {currentDestinations.map((dest, i) => (
                  <motion.div
                    key={dest.code}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/destinations/${dest.code.toLowerCase()}`}
                      className="group block bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {dest.flag}
                        </span>
                        <span className="badge badge-primary">
                          From ${dest.lowestPrice.toFixed(2)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {dest.planCount} {dest.planCount === 1 ? 'plan' : 'plans'} available
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {currentDestinations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No destinations found
                </h3>
                <p className="text-gray-500">
                  Try searching for a different country or browse by region
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Regional Plans CTA */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Europe Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
              >
                <div className="absolute -right-8 -bottom-8 text-[150px] opacity-10">
                  🇪🇺
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                    Regional Plan
                  </span>
                  <h3 className="text-2xl font-bold mb-2">Europe eSIM</h3>
                  <p className="text-white/80 mb-4">
                    One eSIM for 30+ European countries. Perfect for Euro trips.
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">$19.99</span>
                    <span className="text-white/70">/ 5GB</span>
                  </div>
                  <Link
                    href="/destinations/europe"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              </motion.div>

              {/* Asia Plan */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-orange-500 to-rose-500 text-white"
              >
                <div className="absolute -right-8 -bottom-8 text-[150px] opacity-10">
                  🌏
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                    Regional Plan
                  </span>
                  <h3 className="text-2xl font-bold mb-2">Asia eSIM</h3>
                  <p className="text-white/80 mb-4">
                    Coverage across 15+ Asian countries. Ideal for Asia backpackers.
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">$24.99</span>
                    <span className="text-white/70">/ 5GB</span>
                  </div>
                  <Link
                    href="/destinations/asia"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">Common Questions</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Is my phone compatible?</h4>
                  <p className="text-gray-600 text-sm">
                    Most phones from 2018+ support eSIM. Check our <Link href="/compatibility" className="text-indigo-600 hover:underline">compatibility guide</Link>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How fast is activation?</h4>
                  <p className="text-gray-600 text-sm">
                    Instant! You&apos;ll receive your eSIM QR code immediately after purchase.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I keep my number?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes! Your regular SIM stays active. eSIM is just for data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
