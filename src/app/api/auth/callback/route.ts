import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ensureProfileAndWelcome } from '@/lib/auth/post-verify';

// Allowed redirect paths (security: prevent open redirects)
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/business',
  '/business/setup',
  '/business/credentials',
  '/business/subscription',
  '/leads',
  '/my-quotes',
  '/my-requests',
  '/messages',
  '/settings',
  '/request',
  '/admin',
  '/email-verified',
];

function isValidRedirect(path: string): boolean {
  // Must start with / and not contain protocol or double slashes
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return false;
  }
  // Check if it's an allowed path or starts with an allowed path
  return ALLOWED_REDIRECTS.some(allowed => path === allowed || path.startsWith(allowed + '/'));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Validate redirect path
  const redirectPath = isValidRedirect(next) ? next : '/dashboard';

  if (!code) {
    const errorUrl = new URL('/email-verified', origin);
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('error', 'This link is invalid or has expired. If you already confirmed your email, just sign in. Otherwise, request a new confirmation email below.');
    errorUrl.searchParams.set('reason', 'expired');
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      const errorUrl = new URL('/email-verified', origin);
      errorUrl.searchParams.set('status', 'error');
      errorUrl.searchParams.set('error', 'Verification failed. The link may have expired or already been used.');
      return NextResponse.redirect(errorUrl.toString());
    }

    const user = await ensureProfileAndWelcome(supabase);

    if (!user) {
      const errorUrl = new URL('/email-verified', origin);
      errorUrl.searchParams.set('status', 'error');
      errorUrl.searchParams.set('error', 'Could not verify your account. Please try again.');
      return NextResponse.redirect(errorUrl.toString());
    }

    // Redirect to email-verified page with success status
    const verifiedUrl = new URL('/email-verified', origin);
    verifiedUrl.searchParams.set('status', 'success');
    verifiedUrl.searchParams.set('next', redirectPath);
    return NextResponse.redirect(verifiedUrl.toString());
  } catch (error) {
    console.error('Auth callback error:', error);
    // Redirect to email-verified page with error status
    const errorUrl = new URL('/email-verified', origin);
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('error', 'Authentication error. Please try again.');
    return NextResponse.redirect(errorUrl.toString());
  }
}
