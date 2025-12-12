import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 text-neutral-400">
              Last updated: December 2024
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-invert prose-neutral max-w-none">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                  <p className="text-neutral-400 mb-4">
                    We collect information you provide directly to us, such as when you create an account,
                    request a service, or contact us for support. This may include:
                  </p>
                  <ul className="list-disc list-inside text-neutral-400 space-y-2">
                    <li>Name and contact information (email, phone number, address)</li>
                    <li>Account credentials</li>
                    <li>Payment information</li>
                    <li>Service requests and project details</li>
                    <li>Communications with professionals or our support team</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                  <p className="text-neutral-400 mb-4">We use the information we collect to:</p>
                  <ul className="list-disc list-inside text-neutral-400 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Connect homeowners with service professionals</li>
                    <li>Process transactions and send related information</li>
                    <li>Send promotional communications (with your consent)</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h2>
                  <p className="text-neutral-400 mb-4">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-neutral-400 space-y-2">
                    <li>With service professionals when you request a quote or service</li>
                    <li>With vendors and service providers who perform services on our behalf</li>
                    <li>In response to legal process or government requests</li>
                    <li>To protect the rights, property, and safety of AnyTradesman and others</li>
                    <li>In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
                  <p className="text-neutral-400">
                    We implement appropriate technical and organizational measures to protect your personal
                    information against unauthorized access, alteration, disclosure, or destruction. However,
                    no method of transmission over the Internet is 100% secure, and we cannot guarantee
                    absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights and Choices</h2>
                  <p className="text-neutral-400 mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-neutral-400 space-y-2">
                    <li>Access, update, or delete your personal information</li>
                    <li>Opt out of promotional communications</li>
                    <li>Request a copy of your data</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
                  <p className="text-neutral-400">
                    We use cookies and similar tracking technologies to collect information about your
                    browsing activities. You can control cookies through your browser settings, though
                    disabling cookies may affect your ability to use certain features of our service.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">7. Children&apos;s Privacy</h2>
                  <p className="text-neutral-400">
                    Our services are not intended for children under 18 years of age. We do not knowingly
                    collect personal information from children under 18.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
                  <p className="text-neutral-400">
                    We may update this privacy policy from time to time. We will notify you of any changes
                    by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
                  <p className="text-neutral-400">
                    If you have any questions about this Privacy Policy, please contact us at:{' '}
                    <a href="mailto:privacy@anytradesman.com" className="text-red-400 hover:text-red-300">
                      privacy@anytradesman.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
