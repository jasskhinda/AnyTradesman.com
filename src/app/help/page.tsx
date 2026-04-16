import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Help Center | AnyTradesman',
  description: 'Get answers to common questions and support for AnyTradesman.',
};

const faqs = [
  {
    question: 'How do I find a professional?',
    answer: 'Post a service request describing your project and location. Qualified pros in your area will send you quotes. You can also browse businesses directly by category.',
  },
  {
    question: 'Are the professionals verified?',
    answer: 'Businesses on AnyTradesman go through a verification process before they can receive leads. We check for a valid business profile, required credentials, and active subscription.',
  },
  {
    question: 'How much does it cost to use AnyTradesman?',
    answer: "It's completely free for homeowners to post requests and receive quotes. Trade professionals pay a subscription to access and respond to leads.",
  },
  {
    question: 'How do quotes work?',
    answer: "After you post a request, interested pros will send you quotes with their price and timing. Once a pro sends a quote, they'll also receive your contact details so they can reach out to discuss the project directly.",
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Reach out to us at support@anytradesmen.com and we\'ll do our best to help resolve any issues between you and the pro.',
  },
  {
    question: 'How do I become a pro on AnyTradesman?',
    answer: 'Sign up for a business account, complete your profile, add your service categories, and subscribe to start receiving leads in your area.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">Help Center</h1>
            <p className="mt-6 text-lg text-neutral-300">
              Common questions and how to get in touch with our team.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-neutral-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-neutral-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Mail className="w-12 h-12 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-neutral-400 mb-8">
              Email us and we&apos;ll get back to you within 24 hours.
            </p>
            <Link href="mailto:support@anytradesmen.com">
              <Button size="lg">Contact Support</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
