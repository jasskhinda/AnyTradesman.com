import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Terms of Service
            </h1>
            <p className="mt-4 text-neutral-400">
              Last updated: December 2024
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-neutral-400">
                  By accessing or using AnyTradesman&apos;s services, you agree to be bound by these Terms of
                  Service and all applicable laws and regulations. If you do not agree with any of these
                  terms, you are prohibited from using or accessing this site.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p className="text-neutral-400">
                  AnyTradesman provides an online platform that connects homeowners with service professionals.
                  We are not a contractor or service provider ourselves, but rather a marketplace that
                  facilitates connections between users and professionals.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
                <p className="text-neutral-400 mb-4">
                  To use certain features of our service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update any changes to your information</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">4. User Conduct</h2>
                <p className="text-neutral-400 mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Use the service to spam or send unsolicited communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">5. Professional Responsibilities</h2>
                <p className="text-neutral-400">
                  Professionals using our platform agree to maintain all required licenses and insurance,
                  provide accurate information about their services and qualifications, respond to customer
                  inquiries in a timely manner, and deliver services as agreed upon with customers.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">6. Payments and Fees</h2>
                <p className="text-neutral-400">
                  AnyTradesman may charge fees for certain services. All fees are non-refundable unless
                  otherwise stated. Payment terms and pricing are subject to change with reasonable notice.
                  Professionals are responsible for their own tax obligations.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">7. Reviews and Content</h2>
                <p className="text-neutral-400">
                  Users may post reviews and other content on our platform. You retain ownership of your
                  content but grant AnyTradesman a license to use, display, and distribute it. We reserve
                  the right to remove content that violates these terms or is otherwise objectionable.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-neutral-400">
                  THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE
                  THE QUALITY, SAFETY, OR LEGALITY OF SERVICES PROVIDED BY PROFESSIONALS ON OUR PLATFORM.
                  USERS ENGAGE PROFESSIONALS AT THEIR OWN RISK.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                <p className="text-neutral-400">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANYTRADESMAN SHALL NOT BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR
                  USE OF THE SERVICE.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">10. Indemnification</h2>
                <p className="text-neutral-400">
                  You agree to indemnify and hold harmless AnyTradesman and its officers, directors,
                  employees, and agents from any claims, damages, or expenses arising from your use of
                  the service or violation of these terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">11. Termination</h2>
                <p className="text-neutral-400">
                  We may terminate or suspend your account at any time for any reason, including violation
                  of these terms. Upon termination, your right to use the service will immediately cease.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
                <p className="text-neutral-400">
                  These terms shall be governed by and construed in accordance with the laws of the
                  United States, without regard to conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">13. Changes to Terms</h2>
                <p className="text-neutral-400">
                  We reserve the right to modify these terms at any time. We will notify users of
                  significant changes. Continued use of the service after changes constitutes acceptance
                  of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">14. Contact Information</h2>
                <p className="text-neutral-400">
                  For questions about these Terms of Service, please contact us at:{' '}
                  <a href="mailto:legal@anytradesman.com" className="text-red-400 hover:text-red-300">
                    legal@anytradesman.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
