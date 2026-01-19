'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

type AccountType = 'customer' | 'business_owner';

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer',
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Try signing in instead.');
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists. Try signing in instead.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-white">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>. Click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400 text-center">
              Didn&apos;t receive the email? Check your spam folder or try registering again.
            </p>
            <Button
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              onClick={() => router.push('/login')}
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show account type selection first
  if (accountType === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-red-500">AnyTrades</span>
            </Link>
            <CardTitle className="text-white">Join AnyTrades</CardTitle>
            <CardDescription>How would you like to use AnyTrades?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Option */}
            <button
              onClick={() => setAccountType('customer')}
              className="w-full p-6 rounded-xl border-2 border-neutral-700 hover:border-red-500 hover:bg-red-500/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-red-500/20">
                    <svg className="w-6 h-6 text-neutral-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">I need to hire a pro</h3>
                    <p className="text-sm text-neutral-400">Find trusted professionals for your project</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-red-400" />
              </div>
            </button>

            {/* Business Owner Option */}
            <button
              onClick={() => router.push('/register/business')}
              className="w-full p-6 rounded-xl border-2 border-neutral-700 hover:border-red-500 hover:bg-red-500/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-red-500/20">
                    <svg className="w-6 h-6 text-neutral-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">I&apos;m a service professional</h3>
                    <p className="text-sm text-neutral-400">Get leads and grow your business</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-red-400" />
              </div>
            </button>

            <p className="text-center text-sm text-neutral-400 pt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-red-500">AnyTrades</span>
          </Link>
          <CardTitle className="text-white">Create your account</CardTitle>
          <CardDescription>Find trusted professionals for your projects</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Back to selection */}
          <button
            type="button"
            onClick={() => setAccountType(null)}
            className="mb-6 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Change account type
          </button>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}

            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
              disabled={isLoading}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="mt-1 rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-neutral-400">
                I agree to the{' '}
                <Link href="/terms" className="text-red-400 hover:text-red-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-red-400 hover:text-red-300">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
