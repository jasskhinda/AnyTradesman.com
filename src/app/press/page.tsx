import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { FileText, Download, Mail } from 'lucide-react';
import Link from 'next/link';

const pressReleases = [
  {
    date: 'December 2024',
    title: 'AnyTradesman Expands to All 50 States',
    excerpt: 'Platform now connects homeowners with verified professionals nationwide.',
  },
  {
    date: 'October 2024',
    title: 'AnyTradesman Reaches 1 Million Completed Projects',
    excerpt: 'Milestone achievement highlights platform growth and customer satisfaction.',
  },
  {
    date: 'August 2024',
    title: 'New Mobile App Launch',
    excerpt: 'iOS and Android apps make it easier than ever to find and book professionals.',
  },
];

const mediaFeatures = [
  { name: 'TechCrunch', quote: 'The future of home services.' },
  { name: 'Forbes', quote: 'Disrupting a $500B industry.' },
  { name: 'Wall Street Journal', quote: 'Making home improvement accessible.' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Press & Media
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              News, updates, and media resources from AnyTradesman.
            </p>
          </div>
        </section>

        {/* Media Contact */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-neutral-900 rounded-2xl p-8 md:p-12 text-center">
              <Mail className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Media Inquiries</h2>
              <p className="text-neutral-400 mb-6">
                For press inquiries, interview requests, or media resources, please contact our communications team.
              </p>
              <Link href="mailto:press@anytradesman.com">
                <Button size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  press@anytradesman.com
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Press Releases
            </h2>
            <div className="space-y-6">
              {pressReleases.map((release) => (
                <div
                  key={release.title}
                  className="bg-neutral-800 rounded-xl p-6 hover:bg-neutral-750 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-red-400 mb-2">{release.date}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{release.title}</h3>
                  <p className="text-neutral-400">{release.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* In the News */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              In the News
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {mediaFeatures.map((feature) => (
                <div key={feature.name} className="bg-neutral-900 rounded-xl p-6 text-center">
                  <p className="text-xl font-bold text-white mb-3">{feature.name}</p>
                  <p className="text-neutral-400 italic">&ldquo;{feature.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Assets */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Brand Assets
            </h2>
            <p className="text-neutral-400 mb-8">
              Download our logo, brand guidelines, and media kit for editorial use.
            </p>
            <Button size="lg" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Media Kit
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
