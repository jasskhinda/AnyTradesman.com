import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing client if available
  if (client) {
    return client;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Check browser environment at call time, not creation time
          if (typeof document === 'undefined') {
            return [];
          }
          // Parse all cookies from document.cookie
          const pairs = document.cookie.split(';');
          const cookies: { name: string; value: string }[] = [];
          for (const pair of pairs) {
            const [name, ...rest] = pair.trim().split('=');
            if (name) {
              cookies.push({ name, value: rest.join('=') });
            }
          }
          return cookies;
        },
        setAll(cookiesToSet) {
          // Check browser environment at call time, not creation time
          if (typeof document === 'undefined') {
            return;
          }
          for (const { name, value, options } of cookiesToSet) {
            let cookieStr = `${name}=${value}`;
            if (options?.path) cookieStr += `; path=${options.path}`;
            if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`;
            if (options?.domain) cookieStr += `; domain=${options.domain}`;
            if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`;
            if (options?.secure) cookieStr += `; secure`;
            document.cookie = cookieStr;
          }
        },
      },
    }
  );

  return client;
}
