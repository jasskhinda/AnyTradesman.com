'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const next = searchParams.get('next') || '/dashboard';
  const error = searchParams.get('error');
  const [countdown, setCountdown] = useState(5);
  const [resendEmail, setResendEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const isSuccess = status === 'success';

  async function handleResend() {
    const email = resendEmail.trim().toLowerCase();
    if (!email) return;
    setResendState('sending');
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });
      setResendState(resendError ? 'error' : 'sent');
    } catch {
      setResendState('error');
    }
  }

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
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Email Verified!
            </h1>

            <p className="text-neutral-400 mb-6">
              Your email has been successfully verified. Your account is now active.
              {next.includes('/business/setup') && (
                <span className="block mt-2">
                  Next, you&apos;ll complete your business profile to start receiving leads.
                </span>
              )}
            </p>

            <div className="bg-neutral-900 rounded-xl p-6 mb-8">
              <p className="text-neutral-400">
                You will be redirected automatically in{' '}
                <span className="font-semibold text-white">{countdown}</span>{' '}
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
            <div className="mx-auto w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">
              Verification Failed
            </h1>

            <p className="text-neutral-400 mb-6">
              {error || 'We couldn\'t verify your email. The link may have expired or already been used.'}
            </p>

            {/* Resend confirmation email */}
            <div className="bg-neutral-900 rounded-xl p-6 mb-6 text-left">
              <p className="text-sm font-medium text-neutral-300 mb-3">
                Need a new confirmation link? Enter your email:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleResend}
                  disabled={resendState === 'sending' || resendState === 'sent' || !resendEmail.trim()}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {resendState === 'sending' ? 'Sending...' : resendState === 'sent' ? 'Email sent' : 'Resend email'}
                </button>
              </div>
              {resendState === 'sent' && (
                <p className="text-sm text-green-400 mt-3">
                  Confirmation email sent. Give it a minute to arrive, and check your spam folder.
                </p>
              )}
              {resendState === 'error' && (
                <p className="text-sm text-red-400 mt-3">
                  Couldn&apos;t resend right now. Wait a minute and try again, or the email may already be confirmed — try signing in.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-block px-6 py-3 border border-neutral-700 text-neutral-300 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-sm text-neutral-500">
                Need help?{' '}
                <a href="tel:+13172700529" className="text-red-500 hover:underline">
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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
