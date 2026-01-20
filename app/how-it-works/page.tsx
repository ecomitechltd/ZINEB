import Link from 'next/link'
import { ArrowRight, CheckCircle2, Globe, QrCode, ShoppingCart, Smartphone } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">How It Works</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-6">
                Get connected in minutes with VIP eSIM
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl">
                Pick a destination, buy a plan, scan the QR code, and you’re online. No physical SIM, no store visit.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/destinations" className="btn btn-primary text-base px-8 py-4 group">
                  Browse Plans
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/help/install-esim" className="btn btn-secondary text-base px-8 py-4">
                  Installation Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
                4 simple steps
              </h2>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-2">Step 1</div>
                  <h3 className="font-bold text-gray-900 mb-2">Choose destination</h3>
                  <p className="text-sm text-gray-600">
                    Select your country and pick the data plan that fits your trip.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-purple-600 mb-2">Step 2</div>
                  <h3 className="font-bold text-gray-900 mb-2">Checkout</h3>
                  <p className="text-sm text-gray-600">
                    Complete your purchase securely. Your eSIM is delivered instantly.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-indigo-600 mb-2">Step 3</div>
                  <h3 className="font-bold text-gray-900 mb-2">Install eSIM</h3>
                  <p className="text-sm text-gray-600">
                    Scan the QR code on your phone and add the eSIM in settings.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-green-600 mb-2">Step 4</div>
                  <h3 className="font-bold text-gray-900 mb-2">Activate & go</h3>
                  <p className="text-sm text-gray-600">
                    Turn on the eSIM line and data roaming for the eSIM. You’re connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                Quick tips
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'Install before you travel (Wi‑Fi recommended).',
                  'Keep your primary SIM for calls/SMS if needed.',
                  'Use the eSIM line for mobile data during the trip.',
                  'If data doesn’t work, check APN and roaming settings.',
                ].map((tip) => (
                  <div
                    key={tip}
                    className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

