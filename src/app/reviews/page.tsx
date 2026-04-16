import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Customer Reviews | AnyTradesman',
  description: 'Real reviews from real customers using AnyTradesman.',
};

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />
      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Reviews Coming Soon
            </h1>
            <p className="text-lg text-neutral-400 mb-8">
              We&apos;re building a verified review system where real customers rate and review the
              pros they&apos;ve worked with. As our community grows, honest reviews will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg">Find a Pro</Button>
              </Link>
              <Link href="/request">
                <Button size="lg" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  Post a Request
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
