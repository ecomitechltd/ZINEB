import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - eSIMFly',
  description: 'Terms of Service for eSIMFly eSIM services',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-indigo-100">Last updated: January 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                <h2>1. Agreement to Terms</h2>
                <p>
                  By accessing or using the eSIMFly website and services (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p>
                  These Terms apply to all visitors, users, and others who access or use the Service. The Service is operated by [Company Name], located at [Company Address] (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  eSIMFly provides digital eSIM products that enable mobile data connectivity for travelers. Our services include:
                </p>
                <ul>
                  <li>Sale and delivery of eSIM data plans for various destinations</li>
                  <li>Account management and order history</li>
                  <li>Customer support for eSIM activation and usage</li>
                </ul>

                <h2>3. Account Registration</h2>
                <p>
                  To purchase eSIM products, you must create an account. You agree to:
                </p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>

                <h2>4. Purchases and Payment</h2>
                <p>
                  All purchases through our Service are subject to the following conditions:
                </p>
                <ul>
                  <li>Prices are displayed in USD and include applicable taxes</li>
                  <li>Payment is processed securely through our payment providers</li>
                  <li>eSIM delivery is instant upon successful payment</li>
                  <li>You are responsible for ensuring device compatibility before purchase</li>
                </ul>

                <h2>5. eSIM Activation and Usage</h2>
                <p>
                  Upon purchase, you will receive:
                </p>
                <ul>
                  <li>A QR code for eSIM installation</li>
                  <li>An activation code for manual installation</li>
                  <li>Instructions for installation and activation</li>
                </ul>
                <p>
                  Data plans are subject to the validity period and data limits specified at the time of purchase. Unused data does not roll over after the validity period expires.
                </p>

                <h2>6. Device Compatibility</h2>
                <p>
                  eSIM functionality requires a compatible device. It is your responsibility to verify that your device:
                </p>
                <ul>
                  <li>Supports eSIM technology</li>
                  <li>Is carrier unlocked</li>
                  <li>Is compatible with the destination network frequencies</li>
                </ul>
                <p>
                  We are not responsible for eSIMs that cannot be activated due to device incompatibility.
                </p>

                <h2>7. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and functionality are owned by [Company Name] and are protected by international copyright, trademark, and other intellectual property laws.
                </p>

                <h2>8. Prohibited Uses</h2>
                <p>
                  You agree not to use the Service:
                </p>
                <ul>
                  <li>For any unlawful purpose</li>
                  <li>To violate any laws in your jurisdiction</li>
                  <li>To infringe on the rights of others</li>
                  <li>To transmit harmful code or interfere with the Service</li>
                  <li>To resell eSIM products without authorization</li>
                </ul>

                <h2>9. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, [Company Name] shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from:
                </p>
                <ul>
                  <li>Your use or inability to use the Service</li>
                  <li>Network coverage or quality issues</li>
                  <li>Unauthorized access to your account</li>
                  <li>Any third-party conduct on the Service</li>
                </ul>

                <h2>10. Disclaimer of Warranties</h2>
                <p>
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee uninterrupted network coverage or specific data speeds, as these depend on local network conditions.
                </p>

                <h2>11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
                </p>

                <h2>12. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.
                </p>

                <h2>13. Contact Us</h2>
                <p>
                  If you have questions about these Terms, please contact us at:
                </p>
                <ul>
                  <li>Email: legal@esimfly.me</li>
                  <li>Address: [Company Name], [Street Address], [City, Country, Postal Code]</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
