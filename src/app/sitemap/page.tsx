import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

const siteLinks = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Find a Pro', href: '/search' },
    { name: 'Browse Services', href: '/categories' },
    { name: 'How It Works', href: '/how-it-works' },
  ],
  account: [
    { name: 'Sign In', href: '/login' },
    { name: 'Register', href: '/register' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Settings', href: '/settings' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Reviews', href: '/reviews' },
  ],
  resources: [
    { name: 'Help Center', href: '/help' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Success Stories', href: '/success-stories' },
    { name: 'Resources', href: '/resources' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};

export default function SitemapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Sitemap
            </h1>
            <p className="mt-4 text-neutral-400">
              Find your way around AnyTradesman
            </p>
          </div>
        </section>

        {/* Links */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Main Pages */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Main Pages</h2>
                <ul className="space-y-3">
                  {siteLinks.main.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
                <ul className="space-y-3">
                  {siteLinks.account.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Company</h2>
                <ul className="space-y-3">
                  {siteLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Resources</h2>
                <ul className="space-y-3">
                  {siteLinks.resources.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Legal</h2>
                <ul className="space-y-3">
                  {siteLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
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
