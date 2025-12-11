import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/ui/category-card';
import {
  CheckCircle,
  Shield,
  Clock,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const popularCategories = [
  { name: 'Plumbing', slug: 'plumbing', icon: 'wrench', description: 'Repairs, installations & maintenance' },
  { name: 'Electrical', slug: 'electrical', icon: 'zap', description: 'Wiring, repairs & installations' },
  { name: 'HVAC', slug: 'hvac', icon: 'thermometer', description: 'Heating & cooling services' },
  { name: 'Roofing', slug: 'roofing', icon: 'home', description: 'Repair & replacement' },
  { name: 'Painting', slug: 'painting', icon: 'paintbrush', description: 'Interior & exterior' },
  { name: 'Landscaping', slug: 'landscaping', icon: 'trees', description: 'Lawn care & garden design' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'sparkles', description: 'Residential & commercial' },
  { name: 'Handyman', slug: 'handyman', icon: 'tool', description: 'General repairs & maintenance' },
];

const stats = [
  { value: '50K+', label: 'Verified Professionals' },
  { value: '1M+', label: 'Projects Completed' },
  { value: '4.8', label: 'Average Rating' },
  { value: '24/7', label: 'Customer Support' },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every business is vetted with background checks and license verification.',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Get quotes from multiple professionals within hours, not days.',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Read real reviews from verified customers before you hire.',
  },
  {
    icon: CheckCircle,
    title: 'Free Quotes',
    description: 'Compare quotes from multiple pros at no cost to you.',
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Tell us what you need',
    description: 'Answer a few quick questions about your project.',
  },
  {
    step: '2',
    title: 'Get matched with pros',
    description: 'We\'ll connect you with qualified professionals in your area.',
  },
  {
    step: '3',
    title: 'Compare quotes',
    description: 'Review profiles, ratings, and quotes to find the right fit.',
  },
  {
    step: '4',
    title: 'Hire with confidence',
    description: 'Book your pro and get your project done right.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Find Trusted Local Pros for Any Job
              </h1>
              <p className="mt-6 text-lg md:text-xl text-blue-100">
                Connect with verified contractors, get free quotes, and hire the right professional for your home projects.
              </p>

              <div className="mt-10">
                <SearchBar size="large" />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-blue-100">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Free quotes
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified professionals
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Read real reviews
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Popular Services</h2>
              <p className="mt-4 text-lg text-gray-600">
                Browse our most requested home service categories
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularCategories.map((category) => (
                <CategoryCard key={category.slug} {...category} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/categories">
                <Button variant="outline" size="lg">
                  View All Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Why Choose AnyTradesman?</h2>
              <p className="mt-4 text-lg text-gray-600">
                We make finding and hiring professionals easy and safe
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">
                Get your project done in 4 easy steps
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-blue-200" />
                  )}
                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA for Businesses */}
        <section className="bg-blue-600 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-white">
                  Are You a Service Professional?
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Join thousands of contractors growing their business with AnyTradesman. Get matched with customers in your area and build your reputation.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center text-white">
                    <Users className="w-5 h-5 mr-2" />
                    <span>Reach more customers</span>
                  </div>
                  <div className="flex items-center text-white">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span>Grow your business</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Star className="w-5 h-5 mr-2" />
                    <span>Build your reputation</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 md:mt-0">
                <Link href="/register?type=business">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Join as a Pro
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find the perfect professional for your next home project. It&apos;s free and easy.
            </p>
            <div className="mt-8">
              <Link href="/search">
                <Button size="lg">
                  Find a Pro Now
                  <ArrowRight className="w-4 h-4 ml-2" />
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
