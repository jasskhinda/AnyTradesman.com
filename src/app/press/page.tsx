import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Press | AnyTradesman',
  description: 'Media and press inquiries for AnyTradesman.',
};

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />
      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <Newspaper className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Press & Media</h1>
            <p className="text-lg text-neutral-400 mb-8">
              For press inquiries, interviews, or media partnerships, reach out to our team.
              We&apos;d love to share our story.
            </p>
            <Link href="mailto:info@anytradesmen.com">
              <Button size="lg">Contact Press Team</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
