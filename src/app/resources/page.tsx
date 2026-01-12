import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const guides = [
  {
    title: 'Complete Home Maintenance Checklist',
    description: 'Seasonal maintenance tasks to keep your home in top shape.',
    type: 'Guide',
    icon: FileText,
  },
  {
    title: 'How to Hire a Contractor',
    description: 'Essential questions to ask and red flags to watch for.',
    type: 'Guide',
    icon: FileText,
  },
  {
    title: 'Understanding Home Improvement Costs',
    description: 'Average costs for common home projects by region.',
    type: 'Guide',
    icon: FileText,
  },
];

const forProfessionals = [
  {
    title: 'Growing Your Business on AnyTradesman',
    description: 'Tips for optimizing your profile and winning more jobs.',
    type: 'Guide',
    icon: BookOpen,
  },
  {
    title: 'Getting Great Reviews',
    description: 'How to deliver service that earns 5-star ratings.',
    type: 'Guide',
    icon: BookOpen,
  },
  {
    title: 'Pricing Your Services',
    description: 'Strategies for competitive and profitable pricing.',
    type: 'Guide',
    icon: BookOpen,
  },
];

const videos = [
  {
    title: 'Platform Overview',
    description: 'A quick tour of the AnyTradesman platform.',
    duration: '3 min',
  },
  {
    title: 'How to Request a Quote',
    description: 'Step-by-step guide for homeowners.',
    duration: '2 min',
  },
  {
    title: 'Setting Up Your Pro Profile',
    description: 'Make your profile stand out to customers.',
    duration: '5 min',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Resources
            </h1>
            <p className="mt-6 text-lg text-neutral-300">
              Guides, tips, and tools to help you succeed—whether you&apos;re a homeowner or professional.
            </p>
          </div>
        </section>

        {/* For Homeowners */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              For Homeowners
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <div
                  key={guide.title}
                  className="bg-neutral-900 rounded-xl p-6 hover:bg-neutral-850 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                    <guide.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400 mb-2">{guide.type}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{guide.title}</h3>
                  <p className="text-neutral-400">{guide.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Professionals */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              For Professionals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {forProfessionals.map((resource) => (
                <div
                  key={resource.title}
                  className="bg-neutral-800 rounded-xl p-6 hover:bg-neutral-750 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                    <resource.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400 mb-2">{resource.type}</p>
                  <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                  <p className="text-neutral-400">{resource.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Video Tutorials
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.title}
                  className="bg-neutral-900 rounded-xl overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-video bg-neutral-800 flex items-center justify-center">
                    <Video className="w-12 h-12 text-neutral-600 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                      <span className="text-sm text-neutral-500">{video.duration}</span>
                    </div>
                    <p className="text-neutral-400">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Download className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Downloadable Resources
            </h2>
            <p className="text-neutral-400 mb-8">
              Get our free templates, checklists, and guides delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button>
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
