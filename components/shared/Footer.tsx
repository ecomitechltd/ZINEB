import Link from 'next/link'
import Image from 'next/image'
import { Plane, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                eSIM<span className="text-indigo-600">Fly</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-4">
              Stay connected anywhere in the world with instant eSIM data plans.
            </p>

            {/* Company Info */}
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>[Company Name]<br />[Street Address]<br />[City, Country, Postal Code]</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/destinations" className="text-gray-500 hover:text-indigo-600 text-sm">Destinations</Link></li>
              <li><Link href="/coverage" className="text-gray-500 hover:text-indigo-600 text-sm">Coverage Map</Link></li>
              <li><Link href="/help/install-esim" className="text-gray-500 hover:text-indigo-600 text-sm">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-500 hover:text-indigo-600 text-sm">Help Center</Link></li>
              <li><a href="mailto:support@esimfly.me" className="text-gray-500 hover:text-indigo-600 text-sm">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-500 hover:text-indigo-600 text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-indigo-600 text-sm">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-gray-500 hover:text-indigo-600 text-sm">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} eSIMFly. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@esimfly.me</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">We accept:</span>
              <div className="flex items-center gap-3">
                <Image
                  src="/images/visa.png"
                  alt="Visa"
                  width={48}
                  height={32}
                  className="h-6 w-auto object-contain"
                />
                <Image
                  src="/images/master-card.png"
                  alt="Mastercard"
                  width={48}
                  height={32}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
