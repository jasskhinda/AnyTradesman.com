import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Accessibility, Mail } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Accessibility className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Accessibility Statement
            </h1>
            <p className="mt-4 text-neutral-400">
              Our commitment to making AnyTradesman accessible to everyone.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Our Commitment</h2>
                <p className="text-neutral-400">
                  AnyTradesman is committed to ensuring digital accessibility for people with disabilities.
                  We are continually improving the user experience for everyone and applying the relevant
                  accessibility standards to ensure we provide equal access to all users.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Conformance Status</h2>
                <p className="text-neutral-400">
                  We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.
                  These guidelines explain how to make web content more accessible for people with
                  disabilities and more user-friendly for everyone.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Accessibility Features</h2>
                <p className="text-neutral-400 mb-4">Our website includes the following accessibility features:</p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2">
                  <li>Keyboard navigation support throughout the site</li>
                  <li>Alt text for images and meaningful graphics</li>
                  <li>Proper heading hierarchy for screen readers</li>
                  <li>Sufficient color contrast ratios</li>
                  <li>Resizable text without loss of functionality</li>
                  <li>Focus indicators for interactive elements</li>
                  <li>ARIA labels where appropriate</li>
                  <li>Skip navigation links</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Assistive Technologies</h2>
                <p className="text-neutral-400">
                  Our website is designed to be compatible with assistive technologies, including:
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-4">
                  <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                  <li>Screen magnification software</li>
                  <li>Speech recognition software</li>
                  <li>Keyboard-only navigation</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Known Limitations</h2>
                <p className="text-neutral-400">
                  While we strive for full accessibility, some content may not yet be fully accessible.
                  We are actively working to address any gaps. Known limitations include:
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-4">
                  <li>Some older PDF documents may not be fully accessible</li>
                  <li>Third-party content may have varying accessibility levels</li>
                  <li>Some interactive maps may require additional accommodations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Feedback</h2>
                <p className="text-neutral-400">
                  We welcome your feedback on the accessibility of AnyTradesman. If you encounter
                  accessibility barriers or have suggestions for improvement, please let us know:
                </p>
                <div className="mt-4 bg-neutral-900 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-5 h-5 text-red-400" />
                    <a href="mailto:accessibility@anytradesman.com" className="text-red-400 hover:text-red-300">
                      accessibility@anytradesman.com
                    </a>
                  </div>
                  <p className="text-neutral-400 text-sm">
                    We try to respond to accessibility feedback within 2 business days.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Continuous Improvement</h2>
                <p className="text-neutral-400">
                  We are committed to ongoing accessibility improvements. Our efforts include:
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-4">
                  <li>Regular accessibility audits and testing</li>
                  <li>Training for our development and content teams</li>
                  <li>Incorporating accessibility into our design and development processes</li>
                  <li>Engaging with users who rely on assistive technologies</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Additional Resources</h2>
                <p className="text-neutral-400">
                  For more information about web accessibility, visit:
                </p>
                <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-4">
                  <li>
                    <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                      W3C Web Accessibility Initiative (WAI)
                    </a>
                  </li>
                  <li>
                    <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                      ADA.gov
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
