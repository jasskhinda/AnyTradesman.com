import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Monthly',
    price: 49.99,
    billing: '/month',
    billingNote: null,
    savings: null,
    description: 'Full access, cancel anytime.',
    features: [
      'Unlimited lead access',
      'Verified business badge',
      'Priority in search results',
      'Customer messaging',
      'Analytics dashboard',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: '6 Month',
    price: 39.99,
    billing: '/month',
    billingNote: 'Billed $239.94 every 6 months',
    savings: 'Save 20%',
    description: 'Best for growing businesses.',
    features: [
      'Everything in Monthly',
      'Save 20% vs monthly',
      'Extended analytics',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Annual',
    price: 29.99,
    billing: '/month',
    billingNote: 'Billed $359.88 per year',
    savings: 'Save 40%',
    description: 'Maximum savings for committed pros.',
    features: [
      'Everything in 6 Month',
      'Save 40% vs monthly',
      'Featured listings',
      'Dedicated account manager',
    ],
    cta: 'Get Started',
    popular: true,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards and debit cards through our secure payment processor, Stripe.',
  },
  {
    question: 'What if I just want to try a few leads first?',
    answer: 'We offer a Pay Per Lead option at $19.99 per lead with no monthly commitment. You can purchase individual leads and only pay for the ones you want.',
  },
  {
    question: 'Is there a contract?',
    answer: 'No long-term contracts. Monthly plans can be canceled anytime. 6-month and annual plans are billed upfront for the period.',
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
                  {plan.savings && (
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded mb-3">
                      {plan.savings}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-neutral-400 mt-2">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-neutral-400">{plan.billing}</span>
                  </div>
                  {plan.billingNote && (
                    <p className="text-xs text-neutral-500 mt-1">{plan.billingNote}</p>
                  )}
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register/business" className="block mt-8">
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

        {/* Pay Per Lead */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 text-red-400 mb-4">
              <Zap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pay Per Lead - $19.99
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Not ready for a subscription? No problem. Purchase individual leads for $19.99 each.
              View lead details before you buy and only pay for the ones you want to pursue.
            </p>
            <Link href="/register/business" className="inline-block mt-8">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        {/* For Homeowners */}
        <section className="py-16 md:py-24">
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
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-neutral-800 rounded-xl p-6">
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
