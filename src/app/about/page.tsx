import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Users, Target, Heart, Award } from 'lucide-react';

const values = [
  {
    icon: Users,
    title: 'Community First',
    description: 'We believe in building strong connections between homeowners and local professionals.',
  },
  {
    icon: Target,
    title: 'Quality Matters',
    description: 'We verify every professional to ensure you get the best service possible.',
  },
  {
    icon: Heart,
    title: 'Trust & Transparency',
    description: 'Honest reviews, clear pricing, and open communication are at our core.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive to exceed expectations in every interaction.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              About AnyTradesman
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Connecting homeowners with trusted local professionals since 2024.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-400">
                We&apos;re on a mission to make home improvement accessible, transparent, and stress-free.
                By connecting homeowners with verified local professionals, we&apos;re transforming how
                people find and hire skilled tradespeople.
              </p>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-8 md:p-12">
              <h3 className="text-xl font-semibold text-white mb-4">Our Story</h3>
              <p className="text-neutral-400 mb-4">
                AnyTradesman was founded with a simple idea: finding a reliable tradesperson shouldn&apos;t
                be a gamble. Too often, homeowners struggle to find qualified professionals they can trust,
                while skilled tradespeople struggle to find new customers.
              </p>
              <p className="text-neutral-400">
                We built AnyTradesman to bridge this gap. Our platform makes it easy for homeowners to
                find, compare, and hire verified professionals, while helping tradespeople grow their
                businesses with qualified leads.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-neutral-400">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-red-400">50K+</p>
                <p className="text-neutral-400 mt-1">Verified Pros</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-red-400">1M+</p>
                <p className="text-neutral-400 mt-1">Projects Completed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-red-400">4.8</p>
                <p className="text-neutral-400 mt-1">Average Rating</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-red-400">50</p>
                <p className="text-neutral-400 mt-1">States Covered</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
