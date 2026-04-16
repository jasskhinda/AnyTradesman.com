import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Resources | AnyTradesman',
  description: 'Guides and resources for homeowners and trade professionals.',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />
      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Resources Coming Soon
            </h1>
            <p className="text-lg text-neutral-400 mb-8">
              We&apos;re putting together guides for homeowners and trade pros — home maintenance
              checklists, how to hire the right pro, pricing benchmarks, and more. Check back soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/how-it-works">
                <Button size="lg">How It Works</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
