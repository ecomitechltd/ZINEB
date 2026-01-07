'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import {
  Plus,
  Wifi,
  Clock,
  Globe,
  ChevronRight,
  Download,
  QrCode,
  MoreVertical,
  Signal,
  Calendar,
  CreditCard,
} from 'lucide-react'

interface ESim {
  id: string
  country: string
  flag: string
  plan: string
  status: 'active' | 'pending' | 'expired'
  dataUsed: number
  dataTotal: number
  daysLeft: number
  activatedAt: string | null
  qrCode: string | null
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
}

export function DashboardClient({ user, esims, orders, stats }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'esims' | 'orders'>('esims')

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-gray-50">
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
                          {esim.status === 'pending' && (
                            <button className="btn btn-primary text-sm py-2">
                              <QrCode className="w-4 h-4" />
                              View QR Code
                            </button>
                          )}
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {esim.status === 'active' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                          <Signal className="w-4 h-4" />
                          Check Coverage
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                          <Download className="w-4 h-4" />
                          Download Details
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                          <Plus className="w-4 h-4" />
                          Top Up Data
                        </button>
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
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-600'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                                View
                                <ChevronRight className="w-4 h-4" />
                              </button>
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
        </div>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Plus, title: 'Buy New eSIM', desc: 'Browse 190+ destinations', href: '/destinations' },
                { icon: QrCode, title: 'Scan QR Code', desc: 'Install your eSIM', href: '#' },
                { icon: Globe, title: 'Check Coverage', desc: 'View network details', href: '/coverage' },
                { icon: CreditCard, title: 'Add Payment', desc: 'Manage payment methods', href: '/settings/payment' },
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
    </>
  )
}
