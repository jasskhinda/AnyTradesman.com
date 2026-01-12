import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Search, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'Getting Started',
    articles: ['How to create an account', 'Finding a professional', 'Understanding quotes'],
  },
  {
    title: 'For Homeowners',
    articles: ['Requesting a service', 'Reviewing professionals', 'Payment and billing'],
  },
  {
    title: 'For Professionals',
    articles: ['Joining the platform', 'Managing your profile', 'Responding to leads'],
  },
  {
    title: 'Account & Settings',
    articles: ['Updating your profile', 'Password reset', 'Notification preferences'],
  },
];

const faqs = [
  {
    question: 'How do I find a professional?',
    answer: 'Simply enter the service you need and your location on our homepage. You\'ll see a list of verified professionals in your area.',
  },
  {
    question: 'Are the professionals verified?',
    answer: 'Yes, all professionals on AnyTradesman undergo a verification process including license checks, insurance verification, and background screening.',
  },
  {
    question: 'How much does it cost to use AnyTradesman?',
    answer: 'It\'s completely free for homeowners to search, compare, and contact professionals. Professionals pay a subscription or per-lead fee.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Contact our support team immediately. We work with both parties to resolve issues and ensure customer satisfaction.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Help Center
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Find answers, get support, and learn how to make the most of AnyTradesman.
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <div className="flex items-center bg-white/95 rounded-full px-4 py-3">
                <Search className="w-5 h-5 text-neutral-500 mr-3" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="flex-1 bg-transparent focus:outline-none text-neutral-900"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Browse by Topic
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category.title} className="bg-neutral-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.articles.map((article) => (
                      <li key={article}>
                        <Link
                          href="#"
                          className="flex items-center text-neutral-400 hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          {article}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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

        {/* Contact Options */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 rounded-xl p-6 text-center">
                <MessageCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
                <p className="text-neutral-400 mb-4">Chat with our support team in real-time.</p>
                <Button>Start Chat</Button>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 text-center">
                <Mail className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                <p className="text-neutral-400 mb-4">Get a response within 24 hours.</p>
                <Link href="mailto:support@anytradesman.com">
                  <Button variant="outline">Send Email</Button>
                </Link>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 text-center">
                <Phone className="w-10 h-10 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
                <p className="text-neutral-400 mb-4">Mon-Fri, 9am-6pm EST</p>
                <Link href="tel:1-800-555-0123">
                  <Button variant="outline">1-800-555-0123</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
