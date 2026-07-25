import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfileAndWelcome } from '@/lib/auth/post-verify';
import type { EmailOtpType } from '@supabase/supabase-js';

// Email confirmation endpoint. The Supabase email template links here with a
// token_hash. We verify it SERVER-SIDE via verifyOtp — unlike the old
// redirect-to-GoTrue flow, this works no matter which browser or device opens
// the link (no PKCE code exchange, no error lost in a URL hash fragment).

const ALLOWED_NEXT = ['/dashboard', '/business', '/leads', '/my-quotes', '/my-requests', '/messages', '/settings'];

function validNext(path: string | null): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('://')) return null;
  return ALLOWED_NEXT.some((p) => path === p || path.startsWith(p + '/')) ? path : null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = (searchParams.get('type') || 'signup') as EmailOtpType;

  // Older emails carry redirect_to=<callback-url>?next=<path>; honor that next
  let next: string | null = null;
  const redirectTo = searchParams.get('redirect_to');
  if (redirectTo) {
    try {
      next = validNext(new URL(redirectTo, origin).searchParams.get('next'));
    } catch {
      // ignore malformed redirect_to
    }
  }
  next = next ?? validNext(searchParams.get('next'));

  const fail = (message: string, reason: string) => {
    const url = new URL('/email-verified', origin);
    url.searchParams.set('status', 'error');
    url.searchParams.set('error', message);
    url.searchParams.set('reason', reason);
    return NextResponse.redirect(url);
  };

  if (!token_hash) {
    return fail('Invalid verification link.', 'invalid');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    console.error('[auth/verify] verifyOtp failed:', error.code, error.message);
    if (error.code === 'otp_expired') {
      return fail(
        'This confirmation link has expired or was already used. If you already confirmed your email, just sign in. Otherwise, request a new confirmation email below.',
        'expired'
      );
    }
    return fail('Verification failed. Please request a new confirmation email below.', error.code || 'unknown');
  }

  // Success — the user now has a session. Ensure profile + welcome email.
  const user = await ensureProfileAndWelcome(supabase);

  const destination =
    next ??
    (user?.user_metadata?.role === 'business_owner' ? '/business/setup' : '/dashboard');

  const url = new URL('/email-verified', origin);
  url.searchParams.set('status', 'success');
  url.searchParams.set('next', destination);
  return NextResponse.redirect(url);
}
