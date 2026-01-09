'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import {
  CheckCircle,
  Mail,
  Smartphone,
  ArrowRight,
  HelpCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderParam = searchParams.get('order')
  const orderId = orderParam ?? 'unknown'
  const status = searchParams.get('status')

  // Check if payment was declined
  const isDeclined = status === 'declined' || status === 'failed'

  if (isDeclined) {
    return (
      <>
        <Navbar />

        <main className="pt-20 min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* Decline Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-12 h-12 text-red-600" />
              </motion.div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Transaction Declined
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Sorry, your payment could not be processed. Please try again.
              </p>

              {/* Error Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8"
              >
                <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Payment was declined</p>
                    <p className="text-sm text-gray-500">
                      This may be due to insufficient funds, card restrictions, or security checks.
                    </p>
                  </div>
                </div>

                <h3 className="font-semibold text-lg text-left mb-4">What you can do</h3>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">1.</span>
                    Check your card details and try again
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">2.</span>
                    Try a different payment method
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">3.</span>
                    Contact your bank if the issue persists
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">4.</span>
                    Top up your wallet balance and pay from wallet
                  </li>
                </ul>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/checkout" className="btn btn-primary">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Link>
                <Link href="/dashboard?tab=wallet" className="btn btn-secondary">
                  Top Up Wallet
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Need help? <Link href="/help" className="text-indigo-600 hover:underline">Contact support</Link>
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </>
    )
  }

  // Success state
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your eSIM is on its way to your inbox.
            </p>

            {/* Order Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono font-semibold">#{orderId.slice(-8)}</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Check your email</p>
                  <p className="text-sm text-gray-500">
                    Your eSIM QR code and instructions have been sent.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-lg text-left mb-4">Next Steps</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    icon: Mail,
                    title: 'Open the email',
                    desc: 'Find the email with your QR code',
                  },
                  {
                    step: 2,
                    icon: Smartphone,
                    title: 'Scan the QR code',
                    desc: 'Settings > Cellular > Add eSIM',
                  },
                  {
                    step: 3,
                    icon: CheckCircle,
                    title: 'Activate & connect',
                    desc: 'Enable the eSIM for data roaming',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 text-left">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">{item.step}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/help" className="btn btn-secondary">
                <HelpCircle className="w-4 h-4" />
                Need Help?
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
