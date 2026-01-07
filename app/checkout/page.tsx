'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { FlagIcon } from '@/components/shared/FlagIcon'
import {
  ArrowLeft,
  CreditCard,
  Envelope,
  Lock,
  Check,
  ShieldCheck,
  Lightning,
  CaretRight,
  CircleNotch,
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
  const planSlug = searchParams.get('plan') || ''
  const countryCode = searchParams.get('country')?.toUpperCase() || ''

  const [plan, setPlan] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(1)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Fetch plan data from API
  useEffect(() => {
    async function fetchPlan() {
      if (!planSlug) {
        setError('No plan selected')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/packages/plan?slug=${planSlug}`)
        if (!response.ok) {
          throw new Error('Plan not found')
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
  }, [planSlug])

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const discount = promoApplied ? (plan?.price || 0) * (promoDiscount / 100) : 0
  const total = (plan?.price || 0) - discount

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return

    setIsProcessing(true)
    setOrderError(null)

    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCode: plan.packageCode,
          slug: plan.slug,
          email,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Redirect to success with order info
      const params = new URLSearchParams({
        order: data.orderId,
        country: plan.country,
        data: plan.data,
        days: plan.days.toString(),
      })

      if (data.esim?.qrCodeUrl) {
        params.set('qr', data.esim.qrCodeUrl)
      }

      router.push(`/checkout/success?${params.toString()}`)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to process order')
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <CircleNotch weight="bold" className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading plan details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !plan) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
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

      <main className="pt-16 min-h-screen bg-gray-50">
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
                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                    }`}>
                      {step > 1 ? <Check weight="bold" className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="font-medium hidden sm:inline">Email</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200">
                    <div className={`h-full bg-indigo-600 transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
                  </div>
                  <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                    }`}>
                      {step > 2 ? <Check weight="bold" className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="font-medium hidden sm:inline">Payment</span>
                  </div>
                </div>

                {orderError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {orderError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Email */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">Where should we send your eSIM?</h2>
                      <p className="text-gray-500 mb-6">
                        Your QR code and installation instructions will be sent here.
                      </p>

                      <div className="relative mb-6">
                        <Envelope weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input pl-12"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => email && setStep(2)}
                        disabled={!email}
                        className="btn btn-primary w-full"
                      >
                        Continue to Payment
                        <CaretRight weight="bold" className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Payment */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-xl font-bold mb-2">Payment Details</h2>
                      <p className="text-gray-500 mb-6">
                        Secure payment powered by Stripe.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name on card
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card number
                          </label>
                          <div className="relative">
                            <CreditCard weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              maxLength={19}
                              className="input pl-12"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              maxLength={5}
                              className="input"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <div className="relative">
                              <Lock weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                className="input pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="btn btn-secondary"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isProcessing || !name || !cardNumber || !expiry || !cvc}
                          className="btn btn-primary flex-1"
                        >
                          {isProcessing ? (
                            <>
                              <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Pay ${total.toFixed(2)}
                              <Lock weight="bold" className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock weight="bold" className="w-4 h-4" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck weight="bold" className="w-4 h-4" />
                      <span>Secure Checkout</span>
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
                    { icon: Lightning, text: 'Instant delivery to your email' },
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
