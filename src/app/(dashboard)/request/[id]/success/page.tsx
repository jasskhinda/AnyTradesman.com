import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Clock, MapPin, FileText } from 'lucide-react';

export default async function RequestSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: request } = await supabase
    .from('service_requests')
    .select(`
      id,
      title,
      description,
      city,
      state,
      status,
      created_at,
      categories (
        name
      )
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeaderWrapper />

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
                      <span>{(request.categories as unknown as { name: string }).name}</span>
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
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                  <span>Local professionals are notified of your request</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                  <span>Interested pros will send you quotes and contact info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
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
