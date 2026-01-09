import Link from 'next/link'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import {
  Smartphone,
  QrCode,
  Settings,
  Wifi,
  CheckCircle,
  ArrowLeft,
  Apple,
  AlertCircle,
} from 'lucide-react'

export const metadata = {
  title: 'eSIM Installation Guide - eSIMFly',
  description: 'Step-by-step guide to install your eSIMFly eSIM',
}

export default function InstallEsimPage() {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-6">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">eSIM Installation Guide</h1>
            </div>
            <p className="text-indigo-100 max-w-2xl">
              Follow these simple steps to install and activate your eSIM. The process takes less than 5 minutes.
            </p>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Before You Start</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Compatible Device</h3>
                    <p className="text-sm text-gray-600">iPhone XS or later, Pixel 3+, Galaxy S20+</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Stable Internet</h3>
                    <p className="text-sm text-gray-600">WiFi connection recommended for installation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Unlocked Phone</h3>
                    <p className="text-sm text-gray-600">Your device must be carrier unlocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Steps */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Installation Steps</h2>

              {/* iPhone Steps */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Apple className="w-6 h-6 text-gray-900" />
                  <h3 className="text-xl font-semibold text-gray-900">iPhone (iOS 17.4+)</h3>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      icon: Settings,
                      title: 'Open Settings',
                      description: 'Go to Settings > Cellular (or Mobile Data)',
                    },
                    {
                      step: 2,
                      icon: Smartphone,
                      title: 'Add eSIM',
                      description: 'Tap "Add eSIM" or "Add Cellular Plan"',
                    },
                    {
                      step: 3,
                      icon: QrCode,
                      title: 'Scan QR Code',
                      description: 'Select "Use QR Code" and scan the QR code from your purchase email or dashboard',
                    },
                    {
                      step: 4,
                      icon: CheckCircle,
                      title: 'Confirm Installation',
                      description: 'Review the plan details and tap "Add Cellular Plan" to confirm',
                    },
                    {
                      step: 5,
                      icon: Wifi,
                      title: 'Enable Data Roaming',
                      description: 'Go to Settings > Cellular > [Your eSIM] and enable "Data Roaming"',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Android Steps */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6 text-gray-900" />
                  <h3 className="text-xl font-semibold text-gray-900">Android</h3>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      icon: Settings,
                      title: 'Open Settings',
                      description: 'Go to Settings > Network & Internet > SIMs',
                    },
                    {
                      step: 2,
                      icon: Smartphone,
                      title: 'Add eSIM',
                      description: 'Tap the "+" icon or "Add eSIM"',
                    },
                    {
                      step: 3,
                      icon: QrCode,
                      title: 'Scan QR Code',
                      description: 'Select "Scan QR code" and scan the code from your purchase',
                    },
                    {
                      step: 4,
                      icon: CheckCircle,
                      title: 'Download Profile',
                      description: 'Wait for the eSIM profile to download and tap "Activate"',
                    },
                    {
                      step: 5,
                      icon: Wifi,
                      title: 'Enable Data Roaming',
                      description: 'Go to Settings > Network > [Your eSIM] > Roaming and enable it',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Installation */}
              <div className="bg-gray-100 rounded-2xl p-8 mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Manual Installation</h3>
                <p className="text-gray-600 mb-4">
                  If you can&apos;t scan the QR code, you can enter the activation code manually:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Go to Settings &gt; Cellular &gt; Add eSIM</li>
                  <li>Select &quot;Enter Details Manually&quot; or &quot;Use Activation Code&quot;</li>
                  <li>Enter the SM-DP+ address and Activation Code from your dashboard</li>
                  <li>Confirm and activate the eSIM</li>
                </ol>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Tips</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Install the eSIM before traveling - you need WiFi or data to install</li>
                      <li>• Keep Data Roaming enabled on the eSIM line</li>
                      <li>• Your data plan starts when you first connect in your destination</li>
                      <li>• You can keep your physical SIM for calls while using eSIM for data</li>
                      <li>• Each QR code can only be used once - don&apos;t share it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Having Trouble?</h2>
              <p className="text-gray-600 mb-8">
                Our support team is here to help you get connected. Reach out and we&apos;ll assist you with installation.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/help"
                  className="btn btn-outline"
                >
                  Browse Help Center
                </Link>
                <a
                  href="mailto:support@esimfly.me"
                  className="btn btn-primary"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
