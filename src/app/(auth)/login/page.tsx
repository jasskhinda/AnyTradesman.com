'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Allowed redirect paths (security: prevent open redirects)
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/business',
  '/leads',
  '/my-quotes',
  '/my-requests',
  '/messages',
  '/settings',
  '/request',
  '/admin',
];

function isValidRedirect(path: string | null): string {
  if (!path) return '/dashboard';
  // Must start with / and not contain protocol or double slashes
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return '/dashboard';
  }
  // Check if it's an allowed path
  const isAllowed = ALLOWED_REDIRECTS.some(allowed => path === allowed || path.startsWith(allowed + '/'));
  return isAllowed ? path : '/dashboard';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectTo = isValidRedirect(searchParams.get('redirectTo'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(errorParam);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          setError('Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account');
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to the server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="inline-block mb-4">
          <span className="text-2xl font-bold text-red-500">AnyTradesman</span>
        </Link>
        <CardTitle className="text-white">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
              {error}
            </div>
          )}

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
            placeholder="Your password"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-neutral-600 bg-neutral-800 text-red-600 focus:ring-red-500" />
              <span className="ml-2 text-sm text-neutral-400">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-red-400 hover:text-red-300">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>


        <p className="mt-6 text-center text-sm text-neutral-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-red-400 hover:text-red-300 font-medium">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-800 rounded w-1/2 mx-auto" />
              <div className="h-4 bg-neutral-800 rounded w-2/3 mx-auto" />
              <div className="h-10 bg-neutral-800 rounded" />
              <div className="h-10 bg-neutral-800 rounded" />
              <div className="h-10 bg-neutral-800 rounded" />
            </div>
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
