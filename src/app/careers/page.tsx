import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Heart } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Careers | AnyTradesman',
  description: 'Join our team and help transform how homeowners connect with trusted professionals.',
};

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Work when you\'re most productive with flexible hours and remote options.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Join a diverse, talented team passionate about helping homeowners.',
  },
];

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  apply_url: string | null;
}

export default async function CareersPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from('job_postings')
    .select('id, title, department, location, employment_type, apply_url')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const openings: JobPosting[] = jobs || [];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <HeaderWrapper />

      <main className="flex-1">
        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white">Join Our Team</h1>
            <p className="mt-6 text-lg text-neutral-300">
              Help us transform how homeowners connect with trusted professionals.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Why Work With Us
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <benefit.icon className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-neutral-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Open Positions
            </h2>
            {openings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-400 text-lg">
                  We don&apos;t have any open positions right now, but we&apos;re always looking for talented people.
                </p>
                <p className="text-neutral-500 mt-2">Send us your resume and we&apos;ll keep you in mind.</p>
                <Link href="mailto:info@anytradesmen.com" className="inline-block mt-6">
                  <Button size="lg">Get in Touch</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {openings.map((job) => (
                  <div key={job.id} className="bg-neutral-800 rounded-xl p-6 hover:bg-neutral-750 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <p className="text-neutral-400">{job.department}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center text-sm text-neutral-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center text-sm text-neutral-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.employment_type}
                        </span>
                        <a href={job.apply_url || 'mailto:info@anytradesmen.com'}>
                          <Button size="sm">Apply</Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {openings.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Don&apos;t See the Right Role?
              </h2>
              <p className="text-neutral-400 mb-8">
                We&apos;re always looking for talented people. Send us your resume and we&apos;ll
                keep you in mind for future opportunities.
              </p>
              <Link href="mailto:info@anytradesmen.com">
                <Button size="lg">Get in Touch</Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
