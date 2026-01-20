'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  ShoppingCart,
  Smartphone,
  Settings,
  TrendingUp,
  DollarSign,
  Plus,
  Save,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  X,
  Download,
  Mail,
  Calendar,
  CreditCard,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

interface AdminDashboardProps {
  adminUser: {
    name: string
    email: string
  }
}

type Tab = 'overview' | 'users' | 'orders' | 'esims' | 'settings'

interface Stats {
  overview: {
    totalUsers: number
    newUsers: number
    totalOrders: number
    recentOrders: number
    totalRevenue: number
    recentRevenue: number
    totalEsims: number
    activeEsims: number
  }
  ordersByStatus: Record<string, number>
  topCountries: Array<{ country: string; orders: number; revenue: number }>
  recentActivity: Array<{
    id: string
    status: string
    total: number
    countryName: string
    createdAt: string
    user: { email: string; name: string | null }
  }>
}

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  credits: number
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  referralCode: string | null
  _count: { orders: number; esims: number }
}

interface Order {
  id: string
  status: string
  total: number
  discount: number
  countryName: string
  planName: string
  dataAmount: string
  createdAt: string
  user: { id: string; email: string; name: string | null }
}

interface ESim {
  id: string
  iccid: string
  status: string
  countryName: string
  planName: string
  dataUsedGB: number
  dataLimitGB: number
  usagePercent: number
  expiresAt: string
  isGifted: boolean
  user: { id: string; email: string; name: string | null }
}

interface SettingsData {
  markupPercent: number
  businessName: string
  businessAddress: string
  businessEmail: string
  businessPhone: string
  businessVAT: string
}

export function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [esims, setEsims] = useState<ESim[]>([])
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [saving, setSaving] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab, page, search])

  async function loadData() {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'overview':
          const statsRes = await fetch('/api/admin/stats')
          if (statsRes.ok) setStats(await statsRes.json())
          break
        case 'users':
          const usersRes = await fetch(`/api/admin/users?page=${page}&search=${search}`)
          if (usersRes.ok) {
            const data = await usersRes.json()
            setUsers(data.users)
            setTotalPages(data.pagination.totalPages)
          }
          break
        case 'orders':
          const ordersRes = await fetch(`/api/admin/orders?page=${page}&search=${search}`)
          if (ordersRes.ok) {
            const data = await ordersRes.json()
            setOrders(data.orders)
            setTotalPages(data.pagination.totalPages)
          }
          break
        case 'esims':
          const esimsRes = await fetch(`/api/admin/esims?page=${page}&search=${search}`)
          if (esimsRes.ok) {
            const data = await esimsRes.json()
            setEsims(data.esims)
            setTotalPages(data.pagination.totalPages)
          }
          break
        case 'settings':
          const settingsRes = await fetch('/api/admin/settings')
          if (settingsRes.ok) {
            const data = await settingsRes.json()
            setSettings({
              markupPercent: data.settings.markupPercent || 0,
              businessName: data.settings.businessName || 'VIP eSim',
              businessAddress: data.settings.businessAddress || '',
              businessEmail: data.settings.businessEmail || 'support@e-sim.vip',
              businessPhone: data.settings.businessPhone || '',
              businessVAT: data.settings.businessVAT || '',
            })
          }
          break
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  async function saveSettings() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  async function toggleUserActive(userId: string, isActive: boolean) {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      loadData()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  async function makeAdmin(userId: string) {
    if (!confirm('Make this user an admin?')) return
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      })
      loadData()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  async function updateUserCredits(userId: string, credits: number) {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      })
      loadData()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update credits:', error)
    }
  }

  async function downloadOrderPDF(orderId: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/pdf`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `order-${orderId.slice(-8)}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
      alert('Failed to download PDF')
    }
  }

  async function downloadUserWalletStatement(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/wallet-statement`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wallet-statement-${userId.slice(-8)}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download wallet statement:', error)
      alert('Failed to download wallet statement')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'esims', label: 'eSIMs', icon: Smartphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage users, orders, and settings</p>
            </div>
            <button
              onClick={() => loadData()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as Tab); setPage(1); setSearch('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} loading={loading} />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users}
              loading={loading}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              onSelectUser={setSelectedUser}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              loading={loading}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              onDownloadPDF={downloadOrderPDF}
            />
          )}

          {activeTab === 'esims' && (
            <EsimsTab
              esims={esims}
              loading={loading}
              search={search}
              setSearch={setSearch}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              setSettings={setSettings}
              loading={loading}
              saving={saving}
              onSave={saveSettings}
            />
          )}
        </div>

        {/* User Modal */}
        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onToggleActive={toggleUserActive}
            onMakeAdmin={makeAdmin}
            onUpdateCredits={updateUserCredits}
            onDownloadWalletStatement={downloadUserWalletStatement}
          />
        )}
      </main>
      <Footer />
    </>
  )
}

// User Modal Component
function UserModal({
  user,
  onClose,
  onToggleActive,
  onMakeAdmin,
  onUpdateCredits,
  onDownloadWalletStatement,
}: {
  user: UserData
  onClose: () => void
  onToggleActive: (id: string, active: boolean) => void
  onMakeAdmin: (id: string) => void
  onUpdateCredits: (id: string, credits: number) => void
  onDownloadWalletStatement: (id: string) => void
}) {
  const [credits, setCredits] = useState(user.credits / 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">User Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {user.name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name || 'No name'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase">Role</p>
              <p className="font-semibold">{user.role}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase">Status</p>
              <p className={`font-semibold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Disabled'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase">Orders</p>
              <p className="font-semibold">{user._count.orders}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase">eSIMs</p>
              <p className="font-semibold">{user._count.esims}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 uppercase mb-2">Credits</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={credits}
                onChange={e => setCredits(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => onUpdateCredits(user.id, Math.round(credits * 100))}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>

          {user.referralCode && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase">Referral Code</p>
              <p className="font-mono font-semibold">{user.referralCode}</p>
            </div>
          )}

          {/* Download Wallet Statement */}
          <button
            onClick={() => onDownloadWalletStatement(user.id)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Wallet Statement
          </button>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => onToggleActive(user.id, user.isActive)}
              className={`flex-1 py-2 rounded-lg font-medium ${
                user.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {user.isActive ? 'Disable User' : 'Enable User'}
            </button>
            {user.role !== 'ADMIN' && (
              <button
                onClick={() => onMakeAdmin(user.id)}
                className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200"
              >
                Make Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  if (loading || !stats) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  const statCards = [
    { label: 'Total Users', value: stats.overview.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'New Users (30d)', value: stats.overview.newUsers, icon: Plus, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.overview.totalOrders, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Revenue', value: `$${(stats.overview.totalRevenue / 100).toFixed(2)}`, icon: DollarSign, color: 'bg-amber-500' },
    { label: 'Active eSIMs', value: stats.overview.activeEsims, icon: Smartphone, color: 'bg-indigo-500' },
    { label: 'Recent Revenue', value: `$${(stats.overview.recentRevenue / 100).toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {stats.topCountries.slice(0, 5).map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{country.country}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{country.orders} orders</span>
                  <span className="font-semibold text-gray-900">${(country.revenue / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{order.user.email}</p>
                  <p className="text-sm text-gray-500">{order.countryName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(order.total / 100).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Users Tab Component
function UsersTab({
  users, loading, search, setSearch, page, setPage, totalPages, onSelectUser
}: {
  users: UserData[]
  loading: boolean
  search: string
  setSearch: (s: string) => void
  page: number
  setPage: (p: number) => void
  totalPages: number
  onSelectUser: (user: UserData) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Credits</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
            ) : users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-indigo-50 cursor-pointer transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">${(user.credits / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{user._count.orders}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}

// Orders Tab Component
function OrdersTab({
  orders, loading, search, setSearch, page, setPage, totalPages, onDownloadPDF
}: {
  orders: Order[]
  loading: boolean
  search: string
  setSearch: (s: string) => void
  page: number
  setPage: (p: number) => void
  totalPages: number
  onDownloadPDF: (orderId: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{order.id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{order.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{order.countryName}</p>
                  <p className="text-sm text-gray-500">{order.dataAmount}</p>
                </td>
                <td className="px-4 py-3 font-medium">${(order.total / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDownloadPDF(order.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}

// eSIMs Tab Component
function EsimsTab({
  esims, loading, search, setSearch, page, setPage, totalPages
}: {
  esims: ESim[]
  loading: boolean
  search: string
  setSearch: (s: string) => void
  page: number
  setPage: (p: number) => void
  totalPages: number
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search eSIMs by ICCID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ICCID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data Usage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : esims.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No eSIMs found</td></tr>
            ) : esims.map((esim) => (
              <tr key={esim.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{esim.iccid}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{esim.user.email}</td>
                <td className="px-4 py-3 text-gray-700">{esim.countryName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          esim.usagePercent > 80 ? 'bg-red-500' :
                          esim.usagePercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${esim.usagePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{esim.usagePercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    esim.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    esim.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' :
                    esim.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {esim.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(esim.expiresAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}

// Settings Tab Component - Markup and Business Info
function SettingsTab({
  settings, setSettings, loading, saving, onSave
}: {
  settings: SettingsData | null
  setSettings: (s: SettingsData) => void
  loading: boolean
  saving: boolean
  onSave: () => void
}) {
  if (loading || !settings) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Pricing Markup */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing Markup</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Markup Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="200"
                value={settings.markupPercent}
                onChange={(e) => setSettings({ ...settings, markupPercent: parseInt(e.target.value) || 0 })}
                className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
              />
              <span className="text-2xl font-bold text-gray-500">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Example: Base price $10 with {settings.markupPercent}% markup = <strong>${(10 * (1 + settings.markupPercent / 100)).toFixed(2)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
        <p className="text-sm text-gray-500 mb-6">This information appears on invoices and PDF receipts.</p>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="VIP eSim"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={settings.businessAddress}
              onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={2}
              placeholder="20-22 WenlockRoad , London . N1 7GU , UK"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="support@e-sim.vip"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VAT / Tax ID (optional)
            </label>
            <input
              type="text"
              value={settings.businessVAT}
              onChange={(e) => setSettings({ ...settings, businessVAT: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="EU123456789"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  )
}

// Pagination Component
function Pagination({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
