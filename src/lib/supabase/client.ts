import { createBrowserClient } from '@supabase/ssr';

// Only cache client in browser, never during SSR
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // During SSR, always create a fresh client (no caching)
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // In browser, use singleton pattern
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Strip Next.js-injected AbortSignals that cause
        // "AbortError: signal is aborted without reason" on client-side fetches
        fetch: (url, options = {}) => {
          const { signal: _signal, ...rest } = options as RequestInit;
          return fetch(url, rest);
        },
      },
    }
  );

  return browserClient;
}
