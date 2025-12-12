'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Rocket } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give the webhook time to process
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

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
          <p className="text-neutral-400 mt-8">Processing your subscription...</p>
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
              Welcome Aboard!
            </h1>
            <p className="text-neutral-400 mb-8">
              Your subscription is now active. You&apos;re ready to start receiving leads from customers in your area.
            </p>

            <div className="bg-neutral-800/50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-3 text-neutral-300">
                <Rocket className="w-5 h-5 text-blue-400" />
                <span>Your business is now live and searchable!</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/business">
                <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  Complete Your Profile
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <h3 className="font-medium text-white mb-3">Next Steps:</h3>
              <ul className="text-left space-y-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Complete your business profile with photos and details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Upload your credentials for verification badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Start responding to leads in your area</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-6">
            <div className="w-20 h-20 mx-auto bg-neutral-800 rounded-full" />
            <div className="h-8 bg-neutral-800 rounded w-2/3 mx-auto" />
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
