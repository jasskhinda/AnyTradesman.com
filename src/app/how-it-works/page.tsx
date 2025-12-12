import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Search,
  Users,
  MessageSquare,
  CheckCircle,
  Shield,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Tell Us What You Need',
    description:
      'Describe your project and answer a few quick questions about what you need done. Be as specific as possible to get the best matches.',
  },
  {
    icon: Users,
    title: 'Get Matched with Pros',
    description:
      'We\'ll connect you with qualified, pre-screened professionals in your area who specialize in your type of project.',
  },
  {
    icon: MessageSquare,
    title: 'Compare Quotes',
    description:
      'Receive quotes from multiple pros, review their profiles, ratings, and past work. Message them directly with any questions.',
  },
  {
    icon: CheckCircle,
    title: 'Hire with Confidence',
    description:
      'Choose the pro that\'s right for you and your budget. Book them directly and get your project done right.',
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'All pros are background-checked and license-verified.',
  },
  {
    icon: Star,
    title: 'Real Reviews',
    description: 'Read authentic reviews from verified customers.',
  },
  {
    icon: Clock,
    title: 'Quick Responses',
    description: 'Get quotes within hours, not days.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              How AnyTradesman Works
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Getting your home project done has never been easier. We connect you with trusted local professionals in just a few simple steps.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12 md:space-y-16">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex flex-col md:flex-row items-start gap-6 md:gap-8"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <step.icon className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl md:text-2xl font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-neutral-400 text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Why Choose AnyTradesman?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 text-red-400 mb-4">
                    <benefit.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-neutral-400 mb-8">
              Find the perfect professional for your next home project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg">
                  Find a Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register?type=business">
                <Button variant="outline" size="lg" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  Join as a Pro
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
