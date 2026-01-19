'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

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
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Check your email
        </h1>

        <p className="text-gray-600 mb-2">
          We&apos;ve sent a confirmation link to
        </p>
        <p className="text-lg font-medium text-gray-900 mb-6">
          {email}
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-600 mb-4">
            <Mail className="w-5 h-5" />
            <span>Click the link in your email to verify your account</span>
          </div>
          <p className="text-sm text-gray-500">
            Once verified, you&apos;ll be able to complete your business profile and start receiving leads.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
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
          <p className="text-gray-600">
            Questions?{' '}
            <a href="tel:+13172700529" className="text-red-600 hover:underline">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
