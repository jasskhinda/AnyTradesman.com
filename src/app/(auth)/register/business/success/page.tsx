'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-red-500">
            AnyTradesman
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Check your email
        </h1>

        <p className="text-neutral-400 mb-2">
          We&apos;ve sent a confirmation link to
        </p>
        <p className="text-lg font-medium text-white mb-6">
          {email}
        </p>

        <div className="bg-neutral-900 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-neutral-400 mb-4">
            <Mail className="w-5 h-5" />
            <span>Click the link in your email to verify your account</span>
          </div>
          <p className="text-sm text-neutral-500">
            Once verified, you&apos;ll be able to complete your business profile and start receiving leads.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            Didn&apos;t receive the email? Check your spam folder or try registering again.
          </p>

          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>

        {/* Questions */}
        <div className="mt-12 text-center">
          <p className="text-neutral-400">
            Questions?{' '}
            <a href="tel:+13172700529" className="text-red-500 hover:underline">
              +1 (317) 270-0529
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BusinessRegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
