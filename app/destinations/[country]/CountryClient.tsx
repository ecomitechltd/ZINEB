'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { FlagIcon } from '@/components/shared/FlagIcon'
import {
  ArrowLeft,
  WifiHigh,
  Clock,
  CellSignalFull,
  DeviceMobile,
  ShieldCheck,
  CaretRight,
} from '@phosphor-icons/react'

interface Plan {
  id: string
  slug: string
  data: string
  days: number
  price: number
  speed: string
  dataType: number
  popular?: boolean
}

interface CountryData {
  code: string
  name: string
  flag: string
  plans: Plan[]
  networks?: {
    locationName: string
    operators: { name: string; type: string }[]
  }[]
}

interface OtherDestination {
  code: string
  name: string
  flag: string
  lowestPrice: number
}

interface CountryClientProps {
  country: CountryData
  otherDestinations: OtherDestination[]
}

export function CountryClient({ country, otherDestinations }: CountryClientProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleBuyNow = (plan: Plan) => {
    router.push(`/checkout?plan=${plan.slug}&country=${country.code.toLowerCase()}`)
  }

  // Mark most popular plan (middle tier by data)
  const plansWithPopular = country.plans.map((plan, i) => ({
    ...plan,
    popular: i === Math.floor(country.plans.length / 2),
  }))

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
          <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-20">
            <FlagIcon code={country.code} className="w-96 h-64" />
          </div>

          <div className="container mx-auto px-6 py-12 relative z-10">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              Back to destinations
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-6"
            >
              <FlagIcon code={country.code} className="w-24 h-16 rounded-lg shadow-xl" />
              <div className="text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {country.name} eSIM
                </h1>
                <p className="text-xl text-white/80">
                  Instant mobile data - {country.plans[0]?.speed || '4G/LTE'} speeds
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plansWithPopular.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]'
                      : plan.popular
                      ? 'bg-white border-2 border-indigo-200 hover:border-indigo-400'
                      : 'bg-white border border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {plan.popular && selectedPlan !== plan.id && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                      Popular
                    </span>
                  )}

                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-1 ${selectedPlan === plan.id ? 'text-white' : 'text-gray-900'}`}>
                      {plan.data}
                    </div>
                    <div className={`text-sm mb-2 ${selectedPlan === plan.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {plan.days} days validity
                    </div>
                    <div className={`text-xs mb-4 ${selectedPlan === plan.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {plan.speed}
                    </div>
                    <div className={`text-3xl font-bold mb-4 ${selectedPlan === plan.id ? 'text-white' : 'text-indigo-600'}`}>
                      ${plan.price.toFixed(2)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBuyNow(plan)
                      }}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        selectedPlan === plan.id
                          ? 'bg-white text-indigo-600 hover:bg-gray-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Network Info */}
        {country.networks && country.networks.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-6">Network Coverage</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {country.networks.map((network, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-2">{network.locationName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {network.operators.map((op, j) => (
                        <span key={j} className="px-2 py-1 bg-white rounded-lg text-sm text-gray-600 border border-gray-200">
                          {op.name} ({op.type})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: WifiHigh, title: 'High-Speed Data', desc: country.plans[0]?.speed || '4G/LTE speeds' },
                { icon: Clock, title: 'Instant Activation', desc: 'Start using immediately' },
                { icon: CellSignalFull, title: 'Reliable Coverage', desc: 'Local carrier networks' },
                { icon: ShieldCheck, title: 'Secure & Private', desc: 'No data logging' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <feature.icon weight="duotone" className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Install */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">How to Install</h2>

            <div className="max-w-2xl">
              {[
                { step: 1, title: 'Purchase your eSIM', desc: 'Complete checkout and receive your QR code via email instantly.' },
                { step: 2, title: 'Scan the QR code', desc: 'Go to Settings > Cellular > Add eSIM and scan the code.' },
                { step: 3, title: 'Activate & connect', desc: 'Enable the eSIM and select it for data. You\'re online!' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-4 mb-6 last:mb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    {i < 2 && <div className="w-0.5 h-full bg-indigo-200 mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compatibility Check CTA */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <DeviceMobile weight="duotone" className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Not sure if your phone supports eSIM?</h3>
                  <p className="text-gray-600">Check our compatibility guide to make sure.</p>
                </div>
              </div>
              <Link
                href="/compatibility"
                className="btn btn-primary whitespace-nowrap"
              >
                Check Compatibility
                <CaretRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Other Destinations */}
        {otherDestinations.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-6">Other Popular Destinations</h2>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {otherDestinations.map((dest) => (
                  <Link
                    key={dest.code}
                    href={`/destinations/${dest.code.toLowerCase()}`}
                    className="flex-shrink-0 bg-white rounded-xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all min-w-[160px]"
                  >
                    <FlagIcon code={dest.code} className="w-12 h-8 mb-2" />
                    <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-500">From ${dest.lowestPrice.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
