import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - eSIMFly',
  description: 'Privacy Policy for eSIMFly eSIM services',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-indigo-100">Last updated: January 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  [Company Name] (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the eSIMFly website and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                </p>
                <p>
                  We are committed to protecting your privacy and ensuring that your personal information is handled responsibly and in compliance with applicable data protection laws.
                </p>

                <h2>2. Information We Collect</h2>

                <h3>2.1 Personal Information</h3>
                <p>When you create an account or make a purchase, we may collect:</p>
                <ul>
                  <li>Name and email address</li>
                  <li>Billing information and payment details</li>
                  <li>Account credentials</li>
                  <li>Device information for eSIM compatibility</li>
                </ul>

                <h3>2.2 Usage Information</h3>
                <p>We automatically collect certain information when you use our Service:</p>
                <ul>
                  <li>IP address and browser type</li>
                  <li>Device identifiers</li>
                  <li>Pages visited and features used</li>
                  <li>Date and time of access</li>
                </ul>

                <h3>2.3 eSIM Usage Data</h3>
                <p>To provide our services, we may receive information about:</p>
                <ul>
                  <li>Data consumption and remaining balance</li>
                  <li>eSIM activation status</li>
                  <li>Connection history for troubleshooting</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Process transactions and deliver eSIM products</li>
                  <li>Create and manage your account</li>
                  <li>Provide customer support</li>
                  <li>Send order confirmations and service updates</li>
                  <li>Improve our products and services</li>
                  <li>Detect and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>We may share your information with:</p>

                <h3>4.1 Service Providers</h3>
                <p>
                  Third-party companies that help us operate our business, including payment processors, eSIM network providers, and hosting services.
                </p>

                <h3>4.2 Legal Requirements</h3>
                <p>
                  When required by law, court order, or government request, or to protect our rights and safety.
                </p>

                <h3>4.3 Business Transfers</h3>
                <p>
                  In connection with a merger, acquisition, or sale of assets, your information may be transferred to the successor entity.
                </p>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information, including:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure payment processing</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2>6. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to:
                </p>
                <ul>
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                </ul>
                <p>
                  Account information is retained for the duration of your account. Transaction records may be retained longer for legal and accounting purposes.
                </p>

                <h2>7. Your Rights</h2>
                <p>Depending on your location, you may have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@esimfly.me.
                </p>

                <h2>8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to:
                </p>
                <ul>
                  <li>Remember your preferences</li>
                  <li>Understand how you use our Service</li>
                  <li>Improve user experience</li>
                  <li>Provide relevant content</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Disabling cookies may affect some features of our Service.
                </p>

                <h2>9. International Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable laws.
                </p>

                <h2>10. Children&apos;s Privacy</h2>
                <p>
                  Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>

                <h2>11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <ul>
                  <li>Email: privacy@esimfly.me</li>
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
