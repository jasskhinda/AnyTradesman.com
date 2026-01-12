import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for new businesses getting started.',
    features: [
      'Up to 10 leads per month',
      'Basic profile listing',
      'Customer reviews',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'Ideal for growing businesses.',
    features: [
      'Up to 30 leads per month',
      'Featured profile listing',
      'Priority in search results',
      'Customer reviews',
      'Response analytics',
      'Phone & email support',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For established businesses at scale.',
    features: [
      'Unlimited leads',
      'Premium profile listing',
      'Top search placement',
      'Customer reviews',
      'Advanced analytics',
      'Dedicated account manager',
      'API access',
      '24/7 priority support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes, all plans come with a 14-day free trial. No credit card required.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and ACH bank transfers.',
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'No, all plans are month-to-month. Cancel anytime with no penalties.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Choose the plan that works best for your business. No hidden fees.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-neutral-900 rounded-2xl p-8 ${
                    plan.popular ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-neutral-400 mt-2">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-neutral-400">/month</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'primary' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Homeowners */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Free for Homeowners
            </h2>
            <p className="text-neutral-400 text-lg">
              Searching for professionals, getting quotes, and reading reviews is always
              free for homeowners. No subscription required.
            </p>
          </div>
        </section>

        {/* FAQs */}
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
      </main>

      <Footer />
    </div>
  );
}
