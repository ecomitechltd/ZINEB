'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { FlagIcon } from '@/components/shared/FlagIcon'
import { AnimatedWorldMap } from '@/components/shared/AnimatedWorldMap'
import {
  GlobeHemisphereWest,
  Lightning,
  ShieldCheck,
  DeviceMobile,
  ArrowRight,
  CheckCircle,
  Star,
  WifiHigh,
  Clock,
  CreditCard,
  CaretRight,
  CellSignalFull,
  BatteryFull,
} from '@phosphor-icons/react'
import { POPULAR_DESTINATIONS } from '@/lib/constants'

// Animation variants for staggered word reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
}

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

// Word by word text component
function AnimatedText({ text, className, gradient = false }: { text: string; className?: string; gradient?: boolean }) {
  const words = text.split(' ')

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className={`inline-block ${gradient ? 'text-gradient' : ''}`}
          style={{ marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[70vh] flex items-start">
          {/* Background */}
          <div className="absolute inset-0 mesh-gradient" />
          <AnimatedWorldMap />

          {/* Decorative blobs */}
          <div className="absolute top-32 left-0 w-[500px] h-[500px] blob blob-1" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] blob blob-2" />
          <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] blob blob-3" />

          <div className="container mx-auto px-6 pt-20 pb-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 text-sm font-bold uppercase tracking-wide mb-8 shadow-sm"
                >
                  <motion.span
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <GlobeHemisphereWest weight="fill" className="w-4 h-4" />
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    190+ Countries Covered
                  </motion.span>
                </motion.div>

                {/* Headline with word-by-word reveal */}
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] mb-8">
                  <AnimatedText text="Travel the world," />
                  <br />
                  <motion.span
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-gradient"
                    style={{ transitionDelay: '0.5s' }}
                  >
                    {['stay', 'connected'].map((word, i) => (
                      <motion.span
                        key={i}
                        variants={wordVariants}
                        className="inline-block text-gradient"
                        style={{ marginRight: '0.3em' }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.span>
                  <br />
                  <AnimatedText
                    text="With ZiNEB eSIM"
                    className="block text-2xl lg:text-3xl font-bold text-gray-900"
                  />
                </h1>

                {/* Subtitle with smooth fade */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl"
                >
                  Get instant mobile data anywhere. No SIM swaps, no roaming fees.
                  Just scan and connect in seconds.
                </motion.p>

                {/* CTA Buttons with staggered entry */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="flex flex-col sm:flex-row gap-4 mb-14"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/destinations" className="btn btn-primary text-base px-8 py-4 group">
                      Browse Plans
                      <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/how-it-works" className="btn btn-secondary text-base px-8 py-4">
                      How It Works
                    </Link>
                  </motion.div>
                </motion.div>

              </div>

              {/* Right - Phone mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="relative hidden lg:flex justify-center"
              >
                <motion.div
                  className="relative"
                  initial={{ rotateY: -15, rotateX: 5 }}
                  animate={{ rotateY: 0, rotateX: 0 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ perspective: 1000 }}
                >
                  {/* Phone */}
                  <div className="relative w-72 h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-20" />
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-[2.5rem] p-6 text-white overflow-hidden relative">
                      {/* Status bar */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="flex justify-between items-center text-xs mb-8 pt-4"
                      >
                        <span className="font-semibold">9:41</span>
                        <div className="flex items-center gap-1">
                          <CellSignalFull weight="fill" className="w-4 h-4" />
                          <WifiHigh weight="fill" className="w-4 h-4" />
                          <BatteryFull weight="fill" className="w-5 h-5" />
                        </div>
                      </motion.div>

                      {/* Content */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5, duration: 0.5 }}
                          className="mb-4 flex justify-center"
                        >
                          <FlagIcon code="JP" className="w-16 h-11 rounded-lg shadow-lg" />
                        </motion.div>
                        <h3 className="text-2xl font-extrabold uppercase tracking-wide">Japan eSIM</h3>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.7, type: 'spring', stiffness: 300 }}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm mt-2"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Active
                        </motion.div>
                      </motion.div>

                      <div className="mt-10 space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.8, duration: 0.5 }}
                          className="bg-white/15 backdrop-blur-sm rounded-2xl p-5"
                        >
                          <div className="flex justify-between text-sm mb-3">
                            <span className="font-semibold uppercase tracking-wide text-white/80">Data Used</span>
                            <span className="font-bold">2.4 GB / 5 GB</span>
                          </div>
                          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '48%' }}
                              transition={{ duration: 1.5, delay: 2.2 }}
                              className="h-full bg-white rounded-full"
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2, duration: 0.5 }}
                          className="bg-white/15 backdrop-blur-sm rounded-2xl p-5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold uppercase tracking-wide text-white/80 text-sm">Days Left</span>
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 2.3, type: 'spring', stiffness: 200 }}
                              className="text-3xl font-extrabold"
                            >
                              18
                            </motion.span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Decorative */}
                      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    </div>
                  </div>

                  {/* Floating cards - with entrance + float animation */}
                  <motion.div
                    initial={{ opacity: 0, x: -50, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      y: [0, -12, 0],
                    }}
                    transition={{
                      opacity: { delay: 1.8, duration: 0.6 },
                      x: { delay: 1.8, duration: 0.6 },
                      scale: { delay: 1.8, duration: 0.6 },
                      y: { delay: 2.4, duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="absolute -top-4 -left-20 glass rounded-2xl p-4 flex items-center gap-3 shadow-xl"
                  >
                    <FlagIcon code="FR" className="w-12 h-8" />
                    <div>
                      <p className="font-bold text-gray-900">France</p>
                      <p className="text-sm text-gray-500 font-medium">From $1.90</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      y: [0, 10, 0],
                    }}
                    transition={{
                      opacity: { delay: 2, duration: 0.6 },
                      x: { delay: 2, duration: 0.6 },
                      scale: { delay: 2, duration: 0.6 },
                      y: { delay: 2.6, duration: 5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="absolute top-24 -right-24 glass rounded-2xl p-4 flex items-center gap-3 shadow-xl"
                  >
                    <FlagIcon code="US" className="w-12 h-8" />
                    <div>
                      <p className="font-bold text-gray-900">USA</p>
                      <p className="text-sm text-gray-500 font-medium">From $2.50</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -40, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      y: [0, -8, 0],
                    }}
                    transition={{
                      opacity: { delay: 2.2, duration: 0.6 },
                      x: { delay: 2.2, duration: 0.6 },
                      scale: { delay: 2.2, duration: 0.6 },
                      y: { delay: 2.8, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="absolute bottom-32 -left-16 glass rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle weight="fill" className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Connected!</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      y: [0, 14, 0],
                    }}
                    transition={{
                      opacity: { delay: 2.4, duration: 0.6 },
                      x: { delay: 2.4, duration: 0.6 },
                      scale: { delay: 2.4, duration: 0.6 },
                      y: { delay: 3, duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    className="absolute bottom-16 -right-16 glass rounded-2xl p-4 flex items-center gap-3 shadow-xl"
                  >
                    <FlagIcon code="TH" className="w-12 h-8" />
                    <div>
                      <p className="font-bold text-gray-900">Thailand</p>
                      <p className="text-sm text-gray-500 font-medium">From $1.20</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
            >
              <div>
                <h2 className="text-3xl lg:text-4xl font-extrabold mb-3">
                  Popular Destinations
                </h2>
                <p className="text-gray-600 text-lg">
                  Get connected in top travel destinations worldwide
                </p>
              </div>
              <Link
                href="/destinations"
                className="btn btn-secondary self-start md:self-auto group"
              >
                View All
                <CaretRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {POPULAR_DESTINATIONS.slice(0, 6).map((dest, i) => (
                <motion.div
                  key={dest.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={`/destinations/${dest.code.toLowerCase()}`}
                    className="group block bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FlagIcon code={dest.code} className="w-14 h-10 group-hover:scale-110 transition-transform duration-300" />
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {dest.name}
                          </h3>
                          <p className="text-gray-500 font-medium">From <span className="text-indigo-600 font-bold">${dest.from}</span></p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        <ArrowRight weight="bold" className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-50" />

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Get Connected in 3 Steps
              </h2>
              <p className="text-gray-600 text-lg">
                No store visits, no waiting. Just instant data.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '01',
                  icon: DeviceMobile,
                  title: 'Choose Your Plan',
                  description: 'Pick your destination and data package. Plans start from just $0.30.',
                  color: 'primary',
                },
                {
                  step: '02',
                  icon: CreditCard,
                  title: 'Quick Checkout',
                  description: 'Pay securely with card. Get your QR code instantly via email.',
                  color: 'secondary',
                },
                {
                  step: '03',
                  icon: WifiHigh,
                  title: 'Scan & Connect',
                  description: "Scan the QR code, install eSIM, and you're online in seconds.",
                  color: 'accent',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="absolute -top-5 left-8">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/30">
                      {item.step}
                    </span>
                  </div>

                  <div className={`feature-icon feature-icon-${item.color} w-14 h-14 mb-6 mt-4 group-hover:scale-110 transition-transform`}>
                    <item.icon weight="duotone" className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features - Bento grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Why Travelers Choose Us
              </h2>
              <p className="text-gray-600 text-lg">
                The smarter way to stay connected abroad
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Large feature card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-3xl p-10 border border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
              >
                <div className="feature-icon feature-icon-primary w-16 h-16 mb-6">
                  <Lightning weight="duotone" className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4">Instant Activation</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  No waiting for delivery, no store visits. Get your eSIM in your email
                  within seconds and activate it instantly by scanning a QR code.
                </p>
              </motion.div>

              {/* Small feature cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300"
              >
                <div className="feature-icon feature-icon-secondary w-14 h-14 mb-5">
                  <GlobeHemisphereWest weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">190+ Countries</h3>
                <p className="text-gray-600">
                  Coverage across the globe with reliable local carriers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
              >
                <div className="feature-icon feature-icon-accent w-14 h-14 mb-5">
                  <ShieldCheck weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data stays safe. No tracking, no selling your info.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="feature-icon feature-icon-primary w-14 h-14 mb-5">
                  <Clock weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold mb-3">24/7 Support</h3>
                <p className="text-gray-600">
                  Real humans ready to help, anytime you need us.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 text-white">
                Ready to Travel Connected?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of happy travelers. Get your first eSIM today and
                never worry about roaming fees again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/destinations" className="btn bg-white text-indigo-600 hover:bg-gray-100 text-base px-8 py-4 shadow-xl group">
                  Get Started
                  <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/destinations" className="btn border-2 border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                  View Plans
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
