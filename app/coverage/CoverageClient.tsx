'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Globe, Signal, Wifi, Search, ChevronRight, Check } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1IjoiaWFtc2VyZ2VlZWUiLCJhIjoiY21pejJsemozMGkyOTNmczdjajh6M2ZlbSJ9.uCtGI0geWe_8T59AVdjAVw'

// Country coordinates for map
const countryCoordinates: Record<string, [number, number]> = {
  JP: [138.2529, 36.2048], KR: [127.7669, 35.9078], TH: [100.9925, 15.8700],
  SG: [103.8198, 1.3521], MY: [101.9758, 4.2105], ID: [113.9213, -0.7893],
  VN: [108.2772, 14.0583], PH: [121.7740, 12.8797], TW: [120.9605, 23.6978],
  HK: [114.1694, 22.3193], CN: [104.1954, 35.8617], IN: [78.9629, 20.5937],
  US: [-95.7129, 37.0902], CA: [-106.3468, 56.1304], MX: [-102.5528, 23.6345],
  BR: [-51.9253, -14.2350], AR: [-63.6167, -38.4161], GB: [-3.4360, 55.3781],
  FR: [2.2137, 46.2276], DE: [10.4515, 51.1657], IT: [12.5674, 41.8719],
  ES: [-3.7492, 40.4637], NL: [5.2913, 52.1326], PT: [-8.2245, 39.3999],
  CH: [8.2275, 46.8182], AT: [14.5501, 47.5162], BE: [4.4699, 50.5039],
  SE: [18.6435, 60.1282], NO: [8.4689, 60.4720], DK: [9.5018, 56.2639],
  FI: [25.7482, 61.9241], IE: [-8.2439, 53.4129], PL: [19.1451, 51.9194],
  CZ: [15.4730, 49.8175], GR: [21.8243, 39.0742], AU: [133.7751, -25.2744],
  NZ: [174.8860, -40.9006], AE: [53.8478, 23.4241], TR: [35.2433, 38.9637],
  IL: [34.8516, 31.0461], SA: [45.0792, 23.8859], ZA: [22.9375, -30.5595],
  EG: [30.8025, 26.8206], MA: [-7.0926, 31.7917],
}

// Network info per country (static, for display)
const countryNetworks: Record<string, string[]> = {
  JP: ['NTT Docomo', 'SoftBank', 'KDDI'], KR: ['SK Telecom', 'KT', 'LG U+'],
  TH: ['AIS', 'DTAC', 'TrueMove'], SG: ['Singtel', 'StarHub', 'M1'],
  MY: ['Maxis', 'Celcom', 'Digi'], ID: ['Telkomsel', 'XL', 'Indosat'],
  VN: ['Viettel', 'Mobifone', 'Vinaphone'], PH: ['Globe', 'Smart', 'DITO'],
  TW: ['Chunghwa', 'Taiwan Mobile', 'FarEasTone'], HK: ['3 HK', 'CSL', 'SmarTone'],
  CN: ['China Mobile', 'China Unicom', 'China Telecom'], IN: ['Jio', 'Airtel', 'Vi'],
  US: ['AT&T', 'T-Mobile', 'Verizon'], CA: ['Rogers', 'Bell', 'Telus'],
  MX: ['Telcel', 'AT&T', 'Movistar'], BR: ['Vivo', 'Claro', 'TIM'],
  AR: ['Claro', 'Movistar', 'Personal'], GB: ['EE', 'Vodafone', 'Three'],
  FR: ['Orange', 'SFR', 'Bouygues'], DE: ['Telekom', 'Vodafone', 'O2'],
  IT: ['TIM', 'Vodafone', 'WindTre'], ES: ['Movistar', 'Vodafone', 'Orange'],
  NL: ['KPN', 'Vodafone', 'T-Mobile'], PT: ['MEO', 'NOS', 'Vodafone'],
  CH: ['Swisscom', 'Sunrise', 'Salt'], AT: ['A1', 'Magenta', 'Drei'],
  BE: ['Proximus', 'Orange', 'Base'], SE: ['Telia', 'Tele2', 'Tre'],
  NO: ['Telenor', 'Telia', 'Ice'], DK: ['TDC', 'Telenor', 'Telia'],
  FI: ['Elisa', 'DNA', 'Telia'], IE: ['Vodafone', 'Three', 'Eir'],
  PL: ['Orange', 'T-Mobile', 'Plus'], CZ: ['O2', 'T-Mobile', 'Vodafone'],
  GR: ['Cosmote', 'Vodafone', 'Wind'], AU: ['Telstra', 'Optus', 'Vodafone'],
  NZ: ['Spark', 'Vodafone', '2degrees'], AE: ['Etisalat', 'Du'],
  TR: ['Turkcell', 'Vodafone', 'Turk Telekom'], IL: ['Pelephone', 'Cellcom', 'Partner'],
  SA: ['STC', 'Mobily', 'Zain'], ZA: ['Vodacom', 'MTN', 'Cell C'],
  EG: ['Vodafone', 'Orange', 'Etisalat'], MA: ['Maroc Telecom', 'Orange', 'Inwi'],
}

interface CoverageCountry {
  code: string
  name: string
  flag: string
  region: string
  lowestPrice: number
}

interface Props {
  countries: CoverageCountry[]
}

const regions = ['All', 'Asia', 'Europe', 'Americas', 'Oceania', 'Middle East', 'Africa']

export function CoverageClient({ countries }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CoverageCountry | null>(null)

  const filteredCountries = countries.filter(country => {
    const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRegion && matchesSearch
  })

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 30],
      zoom: 1.5,
      projection: 'globe' as unknown as mapboxgl.ProjectionSpecification,
    })

    map.current.on('style.load', () => {
      if (!map.current) return

      // Set fog for globe effect
      map.current.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 220)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(220, 220, 240)',
        'star-intensity': 0.0
      })

      // Add markers for covered countries with popups
      countries.forEach(country => {
        const coords = countryCoordinates[country.code]
        if (!coords) return

        const el = document.createElement('div')
        el.className = 'coverage-marker'
        el.style.cssText = `
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
          cursor: pointer;
        `

        // Create popup with pricing and CTA
        const popupContent = `
          <div style="padding: 8px; min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">${country.flag}</span>
              <div>
                <div style="font-weight: 600; color: #111827; font-size: 14px;">${country.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${country.region}</div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 8px 12px; border-radius: 8px; margin-bottom: 8px;">
              <div style="font-size: 11px; opacity: 0.9;">Starting from</div>
              <div style="font-size: 20px; font-weight: 700;">$${country.lowestPrice.toFixed(2)}</div>
            </div>
            <a href="/destinations/${country.code.toLowerCase()}"
               style="display: block; text-align: center; background: #6366f1; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 13px; transition: background 0.2s;"
               onmouseover="this.style.background='#4f46e5'"
               onmouseout="this.style.background='#6366f1'">
              View Plans
            </a>
          </div>
        `

        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: false,
          closeOnClick: false,
          className: 'coverage-popup'
        }).setHTML(popupContent)

        new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map.current!)

        // Show popup on hover
        el.addEventListener('mouseenter', () => {
          popup.setLngLat(coords).addTo(map.current!)
        })

        el.addEventListener('mouseleave', (e) => {
          // Check if mouse is moving to popup
          const relatedTarget = e.relatedTarget as HTMLElement
          if (relatedTarget && relatedTarget.closest('.mapboxgl-popup')) {
            return
          }
          setTimeout(() => {
            const popupEl = document.querySelector('.mapboxgl-popup')
            if (popupEl && !popupEl.matches(':hover')) {
              popup.remove()
            }
          }, 100)
        })

        // Keep popup open when hovering over it
        popup.getElement()?.addEventListener('mouseleave', () => {
          popup.remove()
        })

        // Click to select country and show details below
        el.addEventListener('click', () => {
          setSelectedCountry(country)
        })
      })
    })

    // Slow auto-rotation
    const secondsPerRevolution = 240
    const maxSpinZoom = 3
    let userInteracting = false

    map.current.on('mousedown', () => { userInteracting = true })
    map.current.on('mouseup', () => { userInteracting = false })
    map.current.on('dragend', () => { userInteracting = false })
    map.current.on('touchend', () => { userInteracting = false })

    function spinGlobe() {
      if (!map.current) return
      const zoom = map.current.getZoom()
      if (!userInteracting && zoom < maxSpinZoom) {
        const distancePerSecond = 360 / secondsPerRevolution
        const center = map.current.getCenter()
        center.lng -= distancePerSecond / 60
        map.current.easeTo({ center, duration: 1000, easing: (n) => n })
      }
    }

    const spinInterval = setInterval(spinGlobe, 1000)

    return () => {
      clearInterval(spinInterval)
      map.current?.remove()
    }
  }, [countries])

  const flyToCountry = (country: CoverageCountry) => {
    const coords = countryCoordinates[country.code]
    if (!coords) return

    setSelectedCountry(country)
    map.current?.flyTo({
      center: coords,
      zoom: 4,
      duration: 2000
    })
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-white">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Global Coverage</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
                Stay Connected in {countries.length}+ Countries
              </h1>
              <p className="text-xl text-indigo-100 mb-8">
                Our eSIM network partners provide reliable 4G/5G coverage worldwide.
                Check our coverage map to see available networks in your destination.
              </p>
              <div className="flex flex-wrap gap-6 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Signal className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">4G/5G Networks</p>
                    <p className="text-sm text-indigo-200">High-speed data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">500+ Carriers</p>
                    <p className="text-sm text-indigo-200">Partner networks</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Search */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Region Filter */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Filter by Region</h3>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(region => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedRegion === region
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      {filteredCountries.length} Countries
                    </h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredCountries.map(country => (
                      <button
                        key={country.code}
                        onClick={() => flyToCountry(country)}
                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                          selectedCountry?.code === country.code ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{country.name}</p>
                            <p className="text-sm text-gray-500">{country.region}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    ref={mapContainer}
                    className="w-full h-[600px]"
                  />
                </div>

                {/* Selected Country Details */}
                {selectedCountry && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{selectedCountry.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedCountry.name}</h3>
                          <p className="text-gray-500">{selectedCountry.region}</p>
                        </div>
                      </div>
                      <Link
                        href={`/destinations/${selectedCountry.code.toLowerCase()}`}
                        className="btn btn-primary"
                      >
                        View Plans
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Available Networks</h4>
                      <div className="flex flex-wrap gap-2">
                        {(countryNetworks[selectedCountry.code] || ['Multiple Networks']).map(network => (
                          <div
                            key={network}
                            className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm"
                          >
                            <Check className="w-4 h-4" />
                            {network}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose VIP eSim Coverage?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We partner with the best carriers worldwide to ensure you get reliable, fast connectivity wherever you travel.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Signal,
                  title: 'Premium Networks',
                  description: 'Connect to top-tier carriers like AT&T, Vodafone, NTT Docomo, and more for the best signal quality.'
                },
                {
                  icon: Globe,
                  title: 'Global Roaming',
                  description: 'One eSIM works across multiple countries. No need to switch SIMs when crossing borders.'
                },
                {
                  icon: Wifi,
                  title: '4G/5G Speeds',
                  description: 'Experience high-speed data with LTE and 5G coverage in major cities and tourist destinations.'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Stay Connected?</h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                Get your eSIM in minutes and enjoy seamless connectivity in {countries.length}+ countries worldwide.
              </p>
              <Link href="/destinations" className="btn bg-white text-indigo-600 hover:bg-gray-100">
                Browse All Destinations
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
