'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { FlagIcon } from '@/components/shared/FlagIcon'
import { WalletTopupModal } from '@/components/wallet'
import {
  ArrowLeft,
  Wallet,
  Lock,
  Check,
  ShieldCheck,
  Lightning,
  CircleNotch,
  WarningCircle,
  Plus,
  SignIn,
} from '@phosphor-icons/react'

interface PlanData {
  packageCode: string
  slug: string
  country: string
  countryCode: string
  flag: string
  data: string
  days: number
  price: number
  speed: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const planParam = searchParams.get('plan') || ''
  const countryCode = searchParams.get('country')?.toUpperCase() || ''

  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [walletLoading, setWalletLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [showTopupModal, setShowTopupModal] = useState(false)
  const [requiredAmount, setRequiredAmount] = useState(0)

  // Fetch wallet balance
  useEffect(() => {
    async function fetchWalletBalance() {
      if (sessionStatus !== 'authenticated') {
        setWalletLoading(false)
        return
      }

      try {
        const response = await fetch('/api/wallet')
        if (response.ok) {
          const data = await response.json()
          setWalletBalance(data.balance)
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error)
      } finally {
        setWalletLoading(false)
      }
    }

    fetchWalletBalance()
  }, [sessionStatus])

  // Fetch plan data from API
  useEffect(() => {
    async function fetchPlan() {
      if (!planParam) {
        setError('No plan selected')
        setLoading(false)
        return
      }

      try {
        let response = await fetch(`/api/packages/plan?slug=${encodeURIComponent(planParam)}`)

        if (response.status === 404) {
          response = await fetch(`/api/packages/plan?packageCode=${encodeURIComponent(planParam)}`)
        }

        if (!response.ok) {
          throw new Error(`Plan not found (${response.status})`)
        }
        const data = await response.json()
        setPlan(data)
      } catch (err) {
        setError('Failed to load plan details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [planParam])

  const discount = promoApplied ? (plan?.price || 0) * (promoDiscount / 100) : 0
  const total = (plan?.price || 0) - discount
  const totalCents = Math.round(total * 100)
  const hasEnoughBalance = walletBalance >= totalCents

  const handleApplyPromo = async () => {
    if (!promoCode) return

    setPromoError(null)
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })

      const data = await response.json()

      if (data.valid) {
        setPromoApplied(true)
        setPromoDiscount(data.discount)
      } else {
        setPromoError(data.message || 'Invalid promo code')
      }
    } catch {
      // Fallback to hardcoded promo for demo
      if (promoCode.toUpperCase() === 'WELCOME10') {
        setPromoApplied(true)
        setPromoDiscount(10)
      } else {
        setPromoError('Invalid promo code')
      }
    }
  }

  const handlePurchase = async () => {
    if (!plan) return

    setIsProcessing(true)
    setOrderError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCode: plan.packageCode,
          slug: plan.slug,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      })

      const data = await response.json()

      if (response.status === 402 && data.error === 'insufficient_balance') {
        // Not enough balance - show topup modal
        setRequiredAmount(data.required)
        setShowTopupModal(true)
        setIsProcessing(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to process purchase')
      }

      // Success! Redirect to success page
      const params = new URLSearchParams({
        order: data.orderId,
        country: plan.country,
        data: plan.data,
        days: plan.days.toString(),
      })

      router.push(`/checkout/success?${params.toString()}`)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to process purchase')
      setIsProcessing(false)
    }
  }

  const handleTopupComplete = () => {
    // Refresh wallet balance after topup
    setShowTopupModal(false)
    // Re-fetch balance
    fetch('/api/wallet')
      .then(res => res.json())
      .then(data => setWalletBalance(data.balance))
      .catch(console.error)
  }

  if (loading || sessionStatus === 'loading') {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <CircleNotch weight="bold" className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  // Not logged in - show login prompt
  if (sessionStatus === 'unauthenticated') {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-4 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
              <SignIn weight="duotone" className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign In Required
            </h1>
            <p className="text-gray-500 mb-6">
              Please sign in to your account to complete your purchase. Your eSIM will be available in your dashboard.
            </p>
            <button
              onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
              className="btn btn-primary w-full mb-4"
            >
              Sign In to Continue
            </button>
            <Link href="/destinations" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Browse more destinations
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  if (error || !plan) {
    return (
      <>
        <Navbar />
        <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Plan not found'}
            </h1>
            <p className="text-gray-500 mb-6">
              The plan you&apos;re looking for is not available.
            </p>
            <Link href="/destinations" className="btn btn-primary">
              Browse Destinations
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 py-4">
            <Link
              href={`/destinations/${countryCode.toLowerCase()}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft weight="bold" className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Checkout Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl font-bold mb-6">Complete Your Purchase</h2>

                {orderError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <WarningCircle weight="fill" className="w-5 h-5" />
                    {orderError}
                  </div>
                )}

                {/* Wallet Balance Card */}
                <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Wallet weight="duotone" className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Your Wallet Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {walletLoading ? (
                            <span className="inline-block w-20 h-7 bg-gray-200 rounded animate-pulse" />
                          ) : (
                            `$${(walletBalance / 100).toFixed(2)}`
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTopupModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition-colors"
                    >
                      <Plus weight="bold" className="w-4 h-4" />
                      Add Funds
                    </button>
                  </div>

                  {!walletLoading && !hasEnoughBalance && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                      <WarningCircle weight="fill" className="w-4 h-4" />
                      <span>
                        You need <strong>${((totalCents - walletBalance) / 100).toFixed(2)}</strong> more for this purchase
                      </span>
                    </div>
                  )}

                  {!walletLoading && hasEnoughBalance && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                      <Check weight="bold" className="w-4 h-4" />
                      <span>Sufficient balance for this purchase</span>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>How it works:</strong>
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check weight="bold" className="w-4 h-4 text-indigo-600" />
                      Payment deducted instantly from your wallet
                    </li>
                    <li className="flex items-center gap-2">
                      <Check weight="bold" className="w-4 h-4 text-indigo-600" />
                      eSIM delivered to your dashboard immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <Check weight="bold" className="w-4 h-4 text-indigo-600" />
                      QR code ready for instant installation
                    </li>
                  </ul>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing || walletLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : hasEnoughBalance ? (
                    <>
                      Pay ${total.toFixed(2)} from Wallet
                      <Lock weight="bold" className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Plus weight="bold" className="w-5 h-5" />
                      Add Funds to Purchase
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock weight="bold" className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck weight="bold" className="w-4 h-4" />
                      <span>Money-Back Guarantee</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24"
              >
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                {/* Plan Details */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                  <FlagIcon code={plan.countryCode || countryCode} className="w-14 h-10" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{plan.country} eSIM</h4>
                    <p className="text-gray-500 text-sm">
                      {plan.data} - {plan.days} days
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {plan.speed}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${plan.price.toFixed(2)}
                  </span>
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoError(null)
                      }}
                      disabled={promoApplied}
                      className="input flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode}
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                        promoApplied
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {promoApplied ? 'Applied!' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-500 mt-1">{promoError}</p>
                  )}
                  {!promoApplied && !promoError && (
                    <p className="text-xs text-gray-400 mt-1">Try: WELCOME10</p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${plan.price.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-4 border-t border-gray-100">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-indigo-600">${total.toFixed(2)}</span>
                </div>

                {/* Features */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {[
                    { icon: Lightning, text: 'Instant delivery to dashboard' },
                    { icon: ShieldCheck, text: '30-day money-back guarantee' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                      <item.icon weight="duotone" className="w-4 h-4 text-indigo-600" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Wallet Topup Modal */}
      <WalletTopupModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        currentBalance={walletBalance}
        minimumRequired={requiredAmount || totalCents}
        onTopupInitiated={handleTopupComplete}
      />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircleNotch weight="bold" className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
