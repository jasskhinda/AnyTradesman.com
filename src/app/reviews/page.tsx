import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah M.',
    location: 'Austin, TX',
    rating: 5,
    service: 'Plumbing',
    text: 'Found an amazing plumber within hours. He fixed our leak quickly and professionally. Highly recommend AnyTradesman!',
  },
  {
    name: 'Michael R.',
    location: 'Denver, CO',
    rating: 5,
    service: 'Electrical',
    text: 'The electrician was on time, explained everything clearly, and did excellent work. Will definitely use this platform again.',
  },
  {
    name: 'Jennifer L.',
    location: 'Seattle, WA',
    rating: 5,
    service: 'HVAC',
    text: 'Our AC broke during a heatwave. Found a technician same day who had it fixed by evening. Lifesaver!',
  },
  {
    name: 'David K.',
    location: 'Miami, FL',
    rating: 5,
    service: 'Roofing',
    text: 'Got multiple quotes quickly and found a great roofer at a fair price. The whole process was smooth.',
  },
  {
    name: 'Emily T.',
    location: 'Chicago, IL',
    rating: 5,
    service: 'Painting',
    text: 'The painter did an incredible job on our living room. Clean, professional, and the results exceeded expectations.',
  },
  {
    name: 'Robert J.',
    location: 'Phoenix, AZ',
    rating: 5,
    service: 'Landscaping',
    text: 'Transformed our backyard into an oasis. The landscaper was creative, hardworking, and stayed on budget.',
  },
];

const stats = [
  { value: '4.8', label: 'Average Rating' },
  { value: '50K+', label: 'Reviews' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Customer Reviews
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              See what homeowners are saying about their experience with AnyTradesman.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl md:text-4xl font-bold text-red-400">{stat.value}</p>
                  <p className="text-neutral-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <div key={index} className="bg-neutral-900 rounded-xl p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-red-400/30 mb-2" />
                  <p className="text-neutral-300 mb-4">{review.text}</p>
                  <div className="border-t border-neutral-800 pt-4">
                    <p className="font-semibold text-white">{review.name}</p>
                    <p className="text-sm text-neutral-400">
                      {review.location} • {review.service}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="bg-neutral-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted by Thousands of Homeowners
            </h2>
            <p className="text-neutral-400">
              Every professional on our platform is verified and reviewed by real customers.
              Your satisfaction is our priority.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
