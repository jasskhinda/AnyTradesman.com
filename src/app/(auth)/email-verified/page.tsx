'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const next = searchParams.get('next') || '/dashboard';
  const error = searchParams.get('error');
  const [countdown, setCountdown] = useState(5);

  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(next);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, next, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            AnyTrades
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Email Verified!
            </h1>

            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Your account is now active.
              {next.includes('/business/setup') && (
                <span className="block mt-2">
                  Next, you&apos;ll complete your business profile to start receiving leads.
                </span>
              )}
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-600">
                You will be redirected automatically in{' '}
                <span className="font-semibold text-gray-900">{countdown}</span>{' '}
                seconds...
              </p>
            </div>

            <Link
              href={next}
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {next.includes('/business/setup') ? 'Complete Business Profile' : 'Continue Now'}
            </Link>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h1>

            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t verify your email. The link may have expired or already been used.'}
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a href="tel:+13172700529" className="text-red-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
