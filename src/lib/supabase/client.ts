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
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}
