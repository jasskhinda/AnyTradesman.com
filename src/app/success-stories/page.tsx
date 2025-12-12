import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Quote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stories = [
  {
    name: 'Johnson Plumbing',
    owner: 'Mike Johnson',
    location: 'Dallas, TX',
    category: 'Plumbing',
    image: null,
    quote: 'AnyTradesman helped us grow from a one-person operation to a team of 5 in just two years. The leads are high quality and the platform is easy to use.',
    stat: '300%',
    statLabel: 'Revenue Growth',
  },
  {
    name: 'Elite Electrical Services',
    owner: 'Sarah Chen',
    location: 'San Jose, CA',
    category: 'Electrical',
    image: null,
    quote: 'As a new business owner, getting my first customers was the hardest part. AnyTradesman connected me with homeowners who needed my services right away.',
    stat: '50+',
    statLabel: 'New Customers/Month',
  },
  {
    name: 'Green Thumb Landscaping',
    owner: 'Carlos Rodriguez',
    location: 'Miami, FL',
    category: 'Landscaping',
    image: null,
    quote: 'The verification badge gives customers confidence in our work. We\'ve built a reputation for quality and now have more referrals than ever.',
    stat: '4.9',
    statLabel: 'Average Rating',
  },
];

const homeownerStories = [
  {
    name: 'Amanda K.',
    location: 'Portland, OR',
    project: 'Kitchen Renovation',
    quote: 'Found an amazing contractor who transformed our outdated kitchen into a modern dream space. The reviews were spot-on!',
  },
  {
    name: 'James T.',
    location: 'Atlanta, GA',
    project: 'Emergency Plumbing',
    quote: 'Pipe burst at midnight. Found a 24/7 plumber through AnyTradesman who arrived within an hour. Saved our home from flooding.',
  },
  {
    name: 'Maria S.',
    location: 'Phoenix, AZ',
    project: 'HVAC Installation',
    quote: 'Got quotes from 5 different HVAC companies in one day. Ended up saving $2,000 compared to other quotes.',
  },
];

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Success Stories
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Real stories from professionals and homeowners who found success with AnyTradesman.
            </p>
          </div>
        </section>

        {/* Professional Stories */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Professional Success Stories
            </h2>
            <div className="space-y-8">
              {stories.map((story) => (
                <div
                  key={story.name}
                  className="bg-neutral-900 rounded-2xl p-8 md:p-12"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <Quote className="w-10 h-10 text-red-400/30 mb-4" />
                      <p className="text-lg text-neutral-300 mb-6">{story.quote}</p>
                      <div>
                        <p className="font-semibold text-white">{story.owner}</p>
                        <p className="text-neutral-400">{story.name}</p>
                        <p className="text-sm text-neutral-500">{story.location} • {story.category}</p>
                      </div>
                    </div>
                    <div className="md:w-48 flex-shrink-0 bg-neutral-800 rounded-xl p-6 text-center flex flex-col justify-center">
                      <p className="text-4xl font-bold text-red-400">{story.stat}</p>
                      <p className="text-neutral-400 mt-1">{story.statLabel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Homeowner Stories */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Homeowner Stories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {homeownerStories.map((story) => (
                <div key={story.name} className="bg-neutral-800 rounded-xl p-6">
                  <p className="text-sm text-red-400 mb-3">{story.project}</p>
                  <p className="text-neutral-300 mb-4">&ldquo;{story.quote}&rdquo;</p>
                  <div className="border-t border-neutral-700 pt-4">
                    <p className="font-semibold text-white">{story.name}</p>
                    <p className="text-sm text-neutral-400">{story.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-neutral-400 mb-8">
              Join thousands of professionals and homeowners who have found success with AnyTradesman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Join as Professional
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline">
                  Find a Professional
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
