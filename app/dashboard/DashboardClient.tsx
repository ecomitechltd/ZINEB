'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import {
  Plus,
  Wifi,
  Clock,
  Globe,
  ChevronRight,
  QrCode,
  Signal,
  Calendar,
  CreditCard,
  X,
  Copy,
  Check,
  Gift,
  FileText,
  Loader2,
  XCircle,
  RefreshCw,
  CheckCircle,
  Download,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
} from 'lucide-react'

interface ESim {
  id: string
  country: string
  countryCode: string
  flag: string
  plan: string
  status: 'active' | 'pending' | 'expired'
  dataUsed: number
  dataTotal: number
  daysLeft: number
  activatedAt: string | null
  qrCode: string | null
  activationCode: string | null
  isGifted?: boolean
  giftedToEmail?: string | null
}

interface Order {
  id: string
  date: string
  country: string
  flag: string
  plan: string
  amount: number
  status: string
}

interface WalletTransaction {
  id: string
  type: 'topup' | 'purchase' | 'refund' | 'bonus'
  amount: number // In cents (positive for credit, negative for debit)
  balance: number // Balance after transaction in cents
  description: string
  status: 'pending' | 'completed' | 'failed'
  date: string
}

interface DashboardClientProps {
  user: {
    name: string
    email: string
  }
  esims: ESim[]
  orders: Order[]
  stats: {
    activeEsims: number
    countriesVisited: number
    totalSaved: number
  }
  paymentError?: string
  paymentSuccess?: string
  walletBalance?: number // In cents
  walletTransactions?: WalletTransaction[]
}

export function DashboardClient({ user, esims, orders, stats, paymentError, paymentSuccess, walletBalance = 0, walletTransactions = [] }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'esims' | 'orders' | 'wallet'>('esims')
  const [selectedEsim, setSelectedEsim] = useState<ESim | null>(null)
  const [copied, setCopied] = useState(false)
  const [giftEsim, setGiftEsim] = useState<ESim | null>(null)
  const [giftForm, setGiftForm] = useState({ email: '', name: '', message: '' })
  const [giftLoading, setGiftLoading] = useState(false)
  const [giftSuccess, setGiftSuccess] = useState(false)
  const [giftError, setGiftError] = useState('')
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)
  const [downloadingStatement, setDownloadingStatement] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(!!paymentError || !!paymentSuccess)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!giftEsim) return

    setGiftLoading(true)
    setGiftError('')

    try {
      const res = await fetch(`/api/esim/${giftEsim.id}/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: giftForm.email,
          recipientName: giftForm.name,
          message: giftForm.message,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send gift')
      }

      setGiftSuccess(true)
      setTimeout(() => {
        setGiftEsim(null)
        setGiftForm({ email: '', name: '', message: '' })
        setGiftSuccess(false)
        window.location.reload()
      }, 2000)
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : 'Failed to send gift')
    } finally {
      setGiftLoading(false)
    }
  }

  const downloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`)
      if (!res.ok) throw new Error('Failed to download invoice')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VIP eSim-Invoice-${orderId.slice(-8).toUpperCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Invoice download error:', err)
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const downloadWalletStatement = async () => {
    setDownloadingStatement(true)
    try {
      const res = await fetch('/api/wallet/statement')
      if (!res.ok) throw new Error('Failed to download statement')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VIP eSim-Wallet-Statement-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Statement download error:', err)
    } finally {
      setDownloadingStatement(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Header with Stats */}
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  Welcome back, {user.name.split(' ')[0]}!
                </motion.h1>
                <p className="text-gray-500 mt-1">
                  Manage your eSIMs and track your data usage.
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link href="/destinations" className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Buy New eSIM
                </Link>
              </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid sm:grid-cols-3 gap-4 mt-8"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active eSIMs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeEsims}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Countries Visited</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.countriesVisited}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Est. Savings</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalSaved.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('esims')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'esims'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              My eSIMs
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === 'wallet'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Wallet
            </button>
          </div>

          {/* eSIMs Tab */}
          {activeTab === 'esims' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {esims.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No eSIMs yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Purchase your first eSIM to get connected anywhere.
                  </p>
                  <Link href="/destinations" className="btn btn-primary">
                    Browse Destinations
                  </Link>
                </div>
              ) : (
                esims.map((esim, i) => (
                  <motion.div
                    key={esim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Country & Status */}
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{esim.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {esim.country}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              esim.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : esim.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {esim.status === 'active' ? 'Active' : esim.status === 'pending' ? 'Ready to Activate' : 'Expired'}
                            </span>
                          </div>
                          <p className="text-gray-500">{esim.plan}</p>
                        </div>
                      </div>

                      {/* Data Usage */}
                      {esim.status === 'active' && (
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">Data Used</span>
                            <span className="font-medium">
                              {esim.dataUsed} GB / {esim.dataTotal} GB
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${(esim.dataUsed / esim.dataTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Days Left / Actions */}
                      <div className="flex items-center gap-4">
                        {esim.status === 'active' && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>{esim.daysLeft} days left</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {(esim.status === 'pending' || esim.status === 'active') && esim.qrCode && (
                            <button
                              onClick={() => setSelectedEsim(esim)}
                              className="btn btn-primary text-sm py-2"
                            >
                              <QrCode className="w-4 h-4" />
                              View QR Code
                            </button>
                          )}
                          {esim.status === 'pending' && !esim.isGifted && (
                            <button
                              onClick={() => setGiftEsim(esim)}
                              className="btn btn-outline text-sm py-2"
                            >
                              <Gift className="w-4 h-4" />
                              Gift
                            </button>
                          )}
                          {esim.isGifted && esim.giftedToEmail && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Gift className="w-4 h-4 text-pink-500" />
                              Gifted to {esim.giftedToEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {esim.status === 'active' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/destinations/${esim.countryCode.toLowerCase()}`}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Signal className="w-4 h-4" />
                          Check Coverage
                        </Link>
                        <button
                          onClick={() => setSelectedEsim(esim)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                          View Details
                        </button>
                        <Link
                          href={`/destinations/${esim.countryCode.toLowerCase()}`}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Top Up Data
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your order history will appear here after your first purchase.
                  </p>
                  <Link href="/destinations" className="btn btn-primary">
                    Browse Destinations
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Destination</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Plan</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-gray-900">
                                {order.id.slice(0, 8)}...
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                {order.date}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{order.flag}</span>
                                <span className="font-medium">{order.country}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{order.plan}</td>
                            <td className="px-6 py-4 font-semibold">${order.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === 'completed' || order.status === 'paid'
                                  ? 'bg-green-100 text-green-600'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : order.status === 'failed'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {(order.status === 'completed' || order.status === 'paid') && (
                                  <button
                                    onClick={() => downloadInvoice(order.id)}
                                    disabled={downloadingInvoice === order.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                                    title="Download Invoice"
                                  >
                                    {downloadingInvoice === order.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                    Invoice
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Current Balance</p>
                    <p className="text-3xl font-bold">${(walletBalance / 100).toFixed(2)}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                  {walletTransactions.length > 0 && (
                    <button
                      onClick={downloadWalletStatement}
                      disabled={downloadingStatement}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {downloadingStatement ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download PDF
                    </button>
                  )}
                </div>
                {walletTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-500">
                      Your wallet activity will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {walletTransactions.map((tx) => (
                      <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.status === 'failed'
                              ? 'bg-red-100'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100'
                              : tx.amount > 0
                              ? 'bg-green-100'
                              : 'bg-gray-100'
                          }`}>
                            {tx.status === 'failed' ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : tx.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : tx.amount > 0 ? (
                              <ArrowUpCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowDownCircle className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tx.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(tx.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.status === 'failed'
                              ? 'text-red-600'
                              : tx.status === 'pending'
                              ? 'text-yellow-600'
                              : tx.amount > 0
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}>
                            {tx.status === 'failed' ? (
                              'Failed'
                            ) : tx.status === 'pending' ? (
                              'Pending'
                            ) : (
                              `${tx.amount > 0 ? '+' : ''}$${(Math.abs(tx.amount) / 100).toFixed(2)}`
                            )}
                          </p>
                          {tx.status === 'completed' && (
                            <p className="text-xs text-gray-500">
                              Balance: ${(tx.balance / 100).toFixed(2)}
                            </p>
                          )}
                          {tx.status !== 'completed' && (
                            <p className={`text-xs ${
                              tx.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                            }`}>
                              {tx.status === 'failed' ? 'Payment declined' : 'Processing...'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Plus, title: 'Buy New eSIM', desc: 'Browse 190+ destinations', href: '/destinations' },
                { icon: QrCode, title: 'Install eSIM', desc: 'Installation guide', href: '/help/install-esim' },
                { icon: Globe, title: 'Check Coverage', desc: 'View network details', href: '/coverage' },
                { icon: CreditCard, title: 'Get Support', desc: 'Help & FAQ', href: '/help' },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <action.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedEsim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEsim(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedEsim.flag}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedEsim.country}</h3>
                    <p className="text-sm text-gray-500">{selectedEsim.plan}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEsim(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex flex-col items-center">
                  {selectedEsim.qrCode && (
                    <>
                      {selectedEsim.qrCode.startsWith('http') ? (
                        // Real QR code URL from eSIM API
                        <Image
                          src={selectedEsim.qrCode}
                          alt="eSIM QR Code"
                          width={200}
                          height={200}
                          className="rounded-lg"
                        />
                      ) : (
                        // Base64 encoded QR code or activation code
                        <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <QrCode className="w-24 h-24 text-gray-300" />
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-4 text-center">
                        Scan this QR code with your phone&apos;s camera to install the eSIM
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Activation Code */}
              {selectedEsim.activationCode && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manual Activation Code
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm font-mono text-gray-800 break-all">
                      {selectedEsim.activationCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedEsim.activationCode!)}
                      className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-indigo-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <h4 className="font-semibold text-gray-900">Installation Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to Settings → Cellular/Mobile Data</li>
                  <li>Tap &quot;Add eSIM&quot; or &quot;Add Cellular Plan&quot;</li>
                  <li>Scan the QR code or enter the activation code manually</li>
                  <li>Wait for the eSIM to be activated (usually instant)</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedEsim(null)}
                  className="flex-1 btn btn-outline"
                >
                  Close
                </button>
                <Link
                  href="/help/install-esim"
                  className="flex-1 btn btn-primary text-center"
                >
                  Installation Guide
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Result Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPaymentModal(false)
              // Clear URL params
              window.history.replaceState({}, '', '/dashboard')
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl text-center"
            >
              {paymentError ? (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Transaction Declined
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Sorry, your payment could not be processed. Please try again or use a different payment method.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/dashboard?tab=wallet"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 btn btn-primary"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Link>
                    <button
                      onClick={() => {
                        setShowPaymentModal(false)
                        window.history.replaceState({}, '', '/dashboard')
                      }}
                      className="flex-1 btn btn-outline"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : paymentSuccess === 'topup' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Wallet Topped Up!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your wallet has been successfully topped up. You can now purchase eSIMs.
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      window.history.replaceState({}, '', '/dashboard')
                    }}
                    className="btn btn-primary"
                  >
                    Continue Shopping
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Success!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your operation completed successfully.
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      window.history.replaceState({}, '', '/dashboard')
                    }}
                    className="btn btn-primary"
                  >
                    Continue
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift eSIM Modal */}
      <AnimatePresence>
        {giftEsim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !giftLoading && setGiftEsim(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            >
              {giftSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gift Sent!</h3>
                  <p className="text-gray-500">
                    Your eSIM has been sent to {giftForm.email}
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <Gift className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Gift this eSIM</h3>
                        <p className="text-sm text-gray-500">{giftEsim.country} - {giftEsim.plan}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setGiftEsim(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={giftLoading}
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleGiftSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={giftForm.email}
                        onChange={(e) => setGiftForm({ ...giftForm, email: e.target.value })}
                        className="input"
                        placeholder="friend@email.com"
                        disabled={giftLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={giftForm.name}
                        onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
                        className="input"
                        placeholder="John"
                        disabled={giftLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personal Message
                      </label>
                      <textarea
                        value={giftForm.message}
                        onChange={(e) => setGiftForm({ ...giftForm, message: e.target.value })}
                        className="input min-h-[80px] resize-none"
                        placeholder="Have a great trip! Stay connected."
                        disabled={giftLoading}
                      />
                    </div>

                    {giftError && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {giftError}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setGiftEsim(null)}
                        className="flex-1 btn btn-outline"
                        disabled={giftLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn btn-primary"
                        disabled={giftLoading}
                      >
                        {giftLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4" />
                            Send Gift
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
