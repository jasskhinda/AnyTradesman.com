import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    errorUrl.searchParams.set('error', 'Missing authentication code. The link may be invalid.');
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

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Get user error:', userError);
      const errorUrl = new URL('/email-verified', origin);
      errorUrl.searchParams.set('status', 'error');
      errorUrl.searchParams.set('error', 'Could not verify your account. Please try again.');
      return NextResponse.redirect(errorUrl.toString());
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when not found

    // Create profile if it doesn't exist
    if (!profile && user.email) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        role: user.user_metadata?.role || 'customer',
      });

      if (insertError) {
        console.error('Profile creation error:', insertError);
        // Continue anyway - user is authenticated, profile can be created later
      }
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
