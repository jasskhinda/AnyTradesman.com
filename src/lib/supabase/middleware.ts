import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Check if request is from admin subdomain
function isAdminSubdomain(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  // Match admin.anytradesman.com or admin.*.vercel.app for preview deployments
  return host.startsWith('admin.') || host.includes('admin-');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdmin = isAdminSubdomain(request);

  // Handle admin subdomain routing
  if (isAdmin) {
    // On admin subdomain, redirect root to /admin
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Only allow /admin routes and auth routes on admin subdomain
    const allowedOnAdmin = ['/admin', '/login', '/register', '/forgot-password', '/api'];
    const isAllowedRoute = allowedOnAdmin.some((route) => pathname.startsWith(route));

    if (!isAllowedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    // Require admin role for /admin routes
    if (pathname.startsWith('/admin')) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        // Not an admin, show access denied or redirect
        const url = request.nextUrl.clone();
        url.pathname = '/admin/access-denied';
        return NextResponse.rewrite(url);
      }
    }

    return supabaseResponse;
  }

  // Main site: block access to /admin routes
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Protected routes for main site
  const protectedRoutes = ['/dashboard', '/business', '/quotes', '/messages', '/settings', '/request'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
