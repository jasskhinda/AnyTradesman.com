/**
 * Resolve the base URL to use for redirects (Stripe success/cancel, billing portal).
 *
 * The user's auth cookies are scoped to whatever domain they are actually browsing
 * (e.g. anytradesmen.com vs. a *.vercel.app preview). If we redirect them back to a
 * different domain after Stripe checkout, they lose their session and get bounced to
 * /login. To avoid that, we return them to the exact origin the request came from,
 * validated against an allowlist, and only fall back to NEXT_PUBLIC_APP_URL.
 */

const ALLOWED_HOST_SUFFIXES = ['anytradesmen.com', '.vercel.app'];
const ALLOWED_HOSTS = ['localhost', '127.0.0.1'];

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.includes(hostname)) return true;
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`) || hostname.endsWith(suffix)
  );
}

function originFromRequest(request: Request): string | null {
  // Origin is sent by browsers on POST (same- and cross-origin) requests.
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (isAllowedHost(new URL(origin).hostname)) return origin;
    } catch {
      // ignore malformed origin
    }
  }

  // Fall back to the Host header (set on every request behind Vercel).
  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const hostname = host.split(':')[0];
    if (isAllowedHost(hostname)) return `${proto}://${host}`;
  }

  return null;
}

/**
 * Returns the base URL (no trailing slash) to use for building redirect URLs.
 */
export function getAppUrl(request: Request): string {
  const candidate = originFromRequest(request);
  if (candidate) return candidate.replace(/\/$/, '');

  const fallback = process.env.NEXT_PUBLIC_APP_URL || 'https://anytradesmen.com';
  return fallback.replace(/\/$/, '');
}
