'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Clock, MapPin, FileText } from 'lucide-react';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

export default function RequestSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequest() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('service_requests')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', params.id)
        .eq('customer_id', user.id)
        .single();

      if (data) {
        setRequest(data);
      }
      setLoading(false);
    }

    loadRequest();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-6">
            <div className="w-20 h-20 mx-auto bg-neutral-800 rounded-full" />
            <div className="h-8 bg-neutral-800 rounded w-2/3 mx-auto" />
            <div className="h-4 bg-neutral-800 rounded w-1/2 mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-16">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Request Submitted!
            </h1>
            <p className="text-neutral-400 mb-8">
              Your service request has been sent to local professionals. You&apos;ll receive quotes directly from qualified tradesmen in your area.
            </p>

            {request && (
              <div className="bg-neutral-800/50 rounded-lg p-4 mb-8 text-left">
                <h3 className="font-medium text-white mb-3">{request.title}</h3>
                <div className="space-y-2 text-sm">
                  {request.categories && (
                    <div className="flex items-center text-neutral-400">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{request.categories.name}</span>
                    </div>
                  )}
                  <div className="flex items-center text-neutral-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{request.city}, {request.state}</span>
                  </div>
                  <div className="flex items-center text-neutral-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Posted just now</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/request">
                <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  Submit Another Request
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <h3 className="font-medium text-white mb-3">What happens next?</h3>
              <ul className="text-left space-y-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                  <span>Local professionals are notified of your request</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                  <span>Interested pros will send you quotes and contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
                  <span>Compare quotes and choose the best fit for your project</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
